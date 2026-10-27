"""
Export SQLite to Supabase PostgreSQL SQL Script
Generates a complete, idempotent PostgreSQL SQL script containing all schemas,
data rows, and real-time configuration for 1-click execution in Supabase SQL Editor.
"""

import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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

MODELS = [
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

def escape_sql_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (dict, list)):
        s = json.dumps(val).replace("'", "''")
        return f"'{s}'"
    # String or datetime
    s = str(val).replace("'", "''")
    return f"'{s}'"

def generate_sql():
    sqlite_url = f"sqlite:///{PROJECT_ROOT / 'compliance_platform.db'}"
    engine = create_engine(sqlite_url)
    Session = sessionmaker(bind=engine)
    session = Session()

    out_lines = []
    out_lines.append("-- ============================================================================")
    out_lines.append("-- AICTE REGULATORY COMPLIANCE PLATFORM: SUPABASE POSTGRESQL SCHEMA & SEED DATA")
    out_lines.append("-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run")
    out_lines.append("-- ============================================================================\n")

    # 1. Table Definitions
    out_lines.append("-- 1. CREATE TABLES (IF NOT EXISTS)")
    out_lines.append("""
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'reviewer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.institutions (
    id VARCHAR(36) PRIMARY KEY,
    institution_code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Engineering & Technology',
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.institutions
    ADD COLUMN IF NOT EXISTS institution_code VARCHAR(64),
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Engineering & Technology';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'institutions' AND column_name = 'aicte_id'
    ) THEN
        UPDATE public.institutions SET institution_code = aicte_id WHERE institution_code IS NULL;
        ALTER TABLE public.institutions ALTER COLUMN aicte_id DROP NOT NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ix_institutions_institution_code
    ON public.institutions (institution_code);

CREATE TABLE IF NOT EXISTS public.applications (
    id VARCHAR(36) PRIMARY KEY,
    application_number VARCHAR(64) UNIQUE NOT NULL,
    institution_id VARCHAR(36) REFERENCES public.institutions(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    academic_year VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    risk_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type VARCHAR(64) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    page_count INTEGER DEFAULT 1,
    extraction_status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_rules (
    id VARCHAR(36) PRIMARY KEY,
    rule_code VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL DEFAULT 'WARNING',
    rule_type VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    parameters JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.extracted_fields (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) REFERENCES public.documents(id) ON DELETE CASCADE,
    field_key VARCHAR(64) NOT NULL,
    raw_text TEXT,
    normalized_value TEXT,
    confidence FLOAT DEFAULT 1.0,
    page_number INTEGER DEFAULT 1,
    bounding_box JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.validation_runs (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) REFERENCES public.applications(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    summary_findings JSONB,
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.findings (
    id VARCHAR(36) PRIMARY KEY,
    validation_run_id VARCHAR(36) REFERENCES public.validation_runs(id) ON DELETE CASCADE,
    application_id VARCHAR(36) REFERENCES public.applications(id) ON DELETE CASCADE,
    rule_id VARCHAR(36) REFERENCES public.compliance_rules(id) ON DELETE SET NULL,
    severity VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    evidence_snippet TEXT,
    status VARCHAR(32) DEFAULT 'OPEN',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_attempts (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) REFERENCES public.documents(id) ON DELETE CASCADE,
    authority_name VARCHAR(120) NOT NULL,
    verification_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    response_payload JSONB,
    verified_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
""")

    # 2. Seed Data
    out_lines.append("\n-- 2. INSERT SEED DATA FROM PLATFORM")
    for model in MODELS:
        table_name = model.__tablename__
        rows = session.query(model).all()
        if not rows:
            continue
        
        cols = [c.name for c in model.__table__.columns]
        cols_str = ", ".join(cols)

        out_lines.append(f"\n-- Data for {table_name} ({len(rows)} rows)")
        for row in rows:
            vals = [escape_sql_value(getattr(row, c)) for c in cols]
            vals_str = ", ".join(vals)
            pk = "id" if "id" in cols else cols[0]
            out_lines.append(f"INSERT INTO public.{table_name} ({cols_str}) VALUES ({vals_str}) ON CONFLICT ({pk}) DO NOTHING;")

    # 3. Enable Realtime Publications
    out_lines.append("""
\n-- 3. ENABLE SUPABASE REALTIME & REPLICA IDENTITY
ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER TABLE public.findings REPLICA IDENTITY FULL;
ALTER TABLE public.audit_events REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.validation_runs REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'applications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'findings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.findings;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'audit_events') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_events;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'documents') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'validation_runs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.validation_runs;
    END IF;
END $$;
""")

    output_path = PROJECT_ROOT / "supabase_schema_and_seed.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))

    print(f"Exported complete Supabase setup to: {output_path}")

if __name__ == "__main__":
    generate_sql()
