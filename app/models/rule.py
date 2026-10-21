import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, JSON
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_code = Column(String(64), unique=True, index=True, nullable=False)  # e.g., RULE-DOC-MANDATORY, RULE-CERT-EXPIRY
    title = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)  # COMPLETENESS, EXPIRY, CONSISTENCY, INTEGRITY, CATEGORY_SPECIFIC
    severity = Column(String(32), default="CRITICAL", nullable=False)  # CRITICAL, MAJOR, MINOR, INFO
    version = Column(Integer, default=1, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=False)
    rule_config = Column(JSON, default=dict, nullable=False)  # Configurable options, thresholds, category requirements
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
