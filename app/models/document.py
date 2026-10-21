import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)  # e.g., FIRE_SAFETY_NOC, BUILDING_COMPLETION_CERT, LAND_TITLE_DEED, PREVIOUS_APPROVAL_LETTER, AFFILIATING_UNIVERSITY_NOC, FINANCIAL_AUDIT_REPORT
    original_filename = Column(String(255), nullable=False)
    storage_filename = Column(String(255), unique=True, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    is_scanned = Column(Boolean, default=False, nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    processing_status = Column(String(32), default="PENDING", nullable=False)  # PENDING, EXTRACTED, FAILED, MANUAL_REVIEW_NEEDED
    upload_timestamp = Column(DateTime, default=utc_now, nullable=False)
    uploaded_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    application = relationship("Application", back_populates="documents")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="document", cascade="all, delete-orphan")
    verification_attempts = relationship("VerificationAttempt", back_populates="document", cascade="all, delete-orphan")
