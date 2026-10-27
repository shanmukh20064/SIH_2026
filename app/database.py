import os
import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings, BASE_DIR

logger = logging.getLogger(__name__)

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
            sqlite_fallback = f"sqlite:///{BASE_DIR / 'compliance_platform.db'}"
            return create_engine(sqlite_fallback, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = create_db_engine()

# Enable foreign keys and WAL mode for SQLite
if str(engine.url).startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
