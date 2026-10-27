"""
Migration Script: SQLite to Supabase PostgreSQL
Migrates all tables and records from local compliance_platform.db to Supabase PostgreSQL.
Preserves UUIDs, timestamps, foreign keys, password hashes, and audit history.
"""

import sys
import os
import argparse
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import (
    User,
    Institution,
    Application,
    Document,
    ExtractedField,
    ComplianceRule,
    ValidationRun,
    Finding,
    VerificationAttempt,
    AuditEvent
)

# Ordered by foreign key dependency
MODELS_IN_ORDER = [
    User,
    Institution,
    Application,
    Document,
    ComplianceRule,
    ExtractedField,
    ValidationRun,
    Finding,
    VerificationAttempt,
    AuditEvent
]

def migrate(source_url: str, target_url: str):
    print("=" * 60)
    print("AICTE Regulatory Platform: Database Migration to Supabase")
    print("=" * 60)
    print(f"Source: {source_url}")
    # Mask password in target for safe printing
    masked_target = target_url
    if "@" in target_url and ":" in target_url.split("@")[0]:
        parts = target_url.split("@")
        cred_part = parts[0]
        prefix = cred_part[:cred_part.rfind(":") + 1]
        masked_target = f"{prefix}******@{parts[1]}"
    print(f"Target: {masked_target}")
    print("-" * 60)

    # Normalize postgresql URL dialect if needed
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    source_engine = create_engine(source_url)
    target_engine = create_engine(target_url, pool_pre_ping=True)

    # 1. Create all schema tables on Target
    print("\n[Step 1/3] Creating schema tables on Supabase PostgreSQL...")
    Base.metadata.create_all(bind=target_engine)
    print("-> Schema tables created successfully.")

    SourceSession = sessionmaker(bind=source_engine)
    TargetSession = sessionmaker(bind=target_engine)

    src_db = SourceSession()
    tgt_db = TargetSession()

    total_migrated = 0

    print("\n[Step 2/3] Migrating data records...")
    try:
        for model in MODELS_IN_ORDER:
            table_name = model.__tablename__
            rows = src_db.query(model).all()
            print(f" -> Migrating '{table_name}' ({len(rows)} records)...", end=" ")

            migrated_count = 0
            for row in rows:
                # Check if already exists in target by primary key
                pk_val = getattr(row, "id")
                existing = tgt_db.query(model).filter(model.id == pk_val).first()
                if not existing:
                    # Detach from source session and insert to target
                    data = {c.name: getattr(row, c.name) for c in model.__table__.columns}
                    new_obj = model(**data)
                    tgt_db.add(new_obj)
                    migrated_count += 1
            
            tgt_db.commit()
            print(f"Done ({migrated_count} inserted, {len(rows) - migrated_count} existed).")
            total_migrated += migrated_count

        print("\n[Step 3/3] Verification of Row Counts:")
        for model in MODELS_IN_ORDER:
            table_name = model.__tablename__
            src_count = src_db.query(model).count()
            tgt_count = tgt_db.query(model).count()
            status_flag = "OK" if src_count <= tgt_count else "MISMATCH"
            print(f" - {table_name:24s}: Source={src_count} | Target={tgt_count} [{status_flag}]")

        print("-" * 60)
        print(f"SUCCESS: Migration to Supabase complete! Total rows inserted: {total_migrated}")
        print("=" * 60)

    except Exception as e:
        tgt_db.rollback()
        print(f"\nERROR DURING MIGRATION: {e}")
        raise e
    finally:
        src_db.close()
        tgt_db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate SQLite to Supabase Postgres")
    parser.add_argument(
        "--source",
        default=f"sqlite:///{PROJECT_ROOT / 'compliance_platform.db'}",
        help="Source SQLite DB URL"
    )
    parser.add_argument(
        "--target",
        default=os.getenv("DATABASE_URL", ""),
        help="Target Supabase Postgres connection string"
    )

    args = parser.parse_args()

    if not args.target or args.target.startswith("sqlite"):
        print("ERROR: Target database URL must be a valid PostgreSQL connection string.")
        print("Example: python scripts/migrate_sqlite_to_supabase.py --target postgresql://postgres.xxxx:mypassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres")
        sys.exit(1)

    migrate(args.source, args.target)
