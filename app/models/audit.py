import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    username = Column(String(64), nullable=True)
    action = Column(String(64), nullable=False)  # USER_LOGIN, DOCUMENT_UPLOAD, VALIDATION_RUN, FINDING_REVIEW, STATUS_CHANGE, RULE_UPDATE, FIELD_OVERRIDE
    resource_type = Column(String(64), nullable=False)  # application, document, finding, rule, user
    resource_id = Column(String(64), nullable=True)
    ip_address = Column(String(64), default="127.0.0.1", nullable=False)
    details = Column(JSON, default=dict, nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False)
