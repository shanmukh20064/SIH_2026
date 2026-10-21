import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_code = Column(String(64), unique=True, index=True, nullable=False)  # e.g., AICTE PID: 1-12345678
    name = Column(String(255), index=True, nullable=False)
    category = Column(String(100), default="Engineering & Technology", nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    applications = relationship("Application", back_populates="institution", cascade="all, delete-orphan")
