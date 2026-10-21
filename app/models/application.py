import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_number = Column(String(64), unique=True, index=True, nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(64), default="EXTENSION_OF_APPROVAL", nullable=False)  # NEW_INSTITUTION, EXTENSION_OF_APPROVAL, INCREASE_INTAKE, NEW_COURSE, CLOSURE
    academic_year = Column(String(32), default="2026-2027", nullable=False)
    status = Column(String(32), default="DRAFT", nullable=False)  # DRAFT, SUBMITTED, IN_SCRUTINY, DEFICIENCY_ISSUED, APPROVED, REJECTED
    submission_date = Column(DateTime, nullable=True)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    institution = relationship("Institution", back_populates="applications")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    validation_runs = relationship("ValidationRun", back_populates="application", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="application", cascade="all, delete-orphan")
    verification_attempts = relationship("VerificationAttempt", back_populates="application", cascade="all, delete-orphan")
