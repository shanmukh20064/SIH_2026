import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ValidationRun(Base):
    __tablename__ = "validation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    executed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    rule_versions_snapshot = Column(JSON, default=dict, nullable=False)  # {"RULE-DOC-MANDATORY": 1, ...}
    total_findings = Column(Integer, default=0, nullable=False)
    critical_findings = Column(Integer, default=0, nullable=False)
    major_findings = Column(Integer, default=0, nullable=False)
    minor_findings = Column(Integer, default=0, nullable=False)
    info_findings = Column(Integer, default=0, nullable=False)
    status = Column(String(32), default="SUCCESS", nullable=False)  # SUCCESS, FAILED, PARTIAL
    summary = Column(Text, nullable=True)
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, default=utc_now, nullable=False)

    application = relationship("Application", back_populates="validation_runs")
    findings = relationship("Finding", back_populates="validation_run", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    validation_run_id = Column(String(36), ForeignKey("validation_runs.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    rule_code = Column(String(64), index=True, nullable=False)
    rule_version = Column(Integer, default=1, nullable=False)
    severity = Column(String(32), default="CRITICAL", nullable=False)  # CRITICAL, MAJOR, MINOR, INFO
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_text = Column(Text, nullable=True)
    detection_method = Column(String(64), default="DETERMINISTIC_RULE", nullable=False)  # DETERMINISTIC_RULE, FUZZY_MATCH, HASH_COLLISION, ANOMALY_HEURISTIC
    recommended_action = Column(Text, nullable=True)
    review_status = Column(String(32), default="FLAGGED", nullable=False)  # FLAGGED, CONFIRMED, DISMISSED, RESOLVED, NEEDS_ADDITIONAL_EVIDENCE
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    validation_run = relationship("ValidationRun", back_populates="findings")
    application = relationship("Application", back_populates="findings")
    document = relationship("Document", back_populates="findings")
