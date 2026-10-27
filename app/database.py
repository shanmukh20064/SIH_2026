import os
import shutil
import logging
from pathlib import Path
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings, BASE_DIR

logger = logging.getLogger(__name__)

def get_sqlite_fallback_path() -> Path:
    db_path = BASE_DIR / "compliance_platform.db"
    if os.getenv("VERCEL"):
        tmp_db = Path("/tmp/compliance_platform.db")
        if not tmp_db.exists() and db_path.exists():
            try:
                shutil.copyfile(str(db_path), str(tmp_db))
            except Exception as e:
                logger.warning(f"Could not copy database to /tmp: {e}")
        if tmp_db.exists():
            return tmp_db
    return db_path

def create_db_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
    else:
        # PostgreSQL / Supabase
        connect_args = {"connect_timeout": 4}
        try:
            eng = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            return eng
        except Exception as e:
            logger.warning(f"Remote Supabase DB unreachable ({e}). Using local fallback database.")
            fallback_path = get_sqlite_fallback_path()
            sqlite_fallback = f"sqlite:///{fallback_path}"
            return create_engine(sqlite_fallback, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = create_db_engine()

# Enable foreign keys for SQLite safely
if str(engine.url).startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            if not os.getenv("VERCEL"):
                cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()
        except Exception as err:
            logger.warning(f"Could not set SQLite pragmas: {err}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
