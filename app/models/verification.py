import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class VerificationAttempt(Base):
    __tablename__ = "verification_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    adapter_name = Column(String(64), nullable=False)  # MockAICTERegistryAdapter, MockFireSafetyRegistryAdapter
    external_reference = Column(String(100), nullable=True)
    status = Column(String(32), default="MOCK_SIMULATED", nullable=False)  # VERIFIED, MISMATCH, EXPIRED, PENDING, SOURCE_UNAVAILABLE, MANUAL_VERIFICATION_REQUIRED, MOCK_SIMULATED
    response_payload = Column(JSON, default=dict, nullable=False)
    attempted_at = Column(DateTime, default=utc_now, nullable=False)

    application = relationship("Application", back_populates="verification_attempts")
    document = relationship("Document", back_populates="verification_attempts")
