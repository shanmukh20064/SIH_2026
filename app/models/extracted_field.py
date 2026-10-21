import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(100), nullable=False)  # institution_name, institution_id, certificate_number, issue_date, expiry_date, issuing_authority, land_area, etc.
    extracted_value = Column(Text, nullable=True)
    normalized_value = Column(Text, nullable=True)  # standardized e.g. YYYY-MM-DD for dates, uppercase for IDs
    confidence = Column(Float, default=1.0, nullable=False)
    source_page = Column(Integer, default=1, nullable=False)
    raw_text_snippet = Column(Text, nullable=True)
    bounding_box = Column(JSON, nullable=True)
    is_inferred = Column(Boolean, default=False, nullable=False)
    reviewer_corrected_value = Column(Text, nullable=True)
    reviewed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    document = relationship("Document", back_populates="extracted_fields")
