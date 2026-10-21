from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class FindingResponse(BaseModel):
    id: str
    validation_run_id: str
    application_id: str
    document_id: Optional[str] = None
    rule_code: str
    rule_version: int
    severity: str
    title: str
    explanation: str
    evidence_text: Optional[str] = None
    detection_method: str
    recommended_action: Optional[str] = None
    review_status: str
    reviewer_notes: Optional[str] = None
    reviewed_by_user_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FindingReviewRequest(BaseModel):
    review_status: str  # CONFIRMED, DISMISSED, RESOLVED, NEEDS_ADDITIONAL_EVIDENCE
    reviewer_notes: Optional[str] = None

class ValidationRunResponse(BaseModel):
    id: str
    application_id: str
    executed_by_user_id: Optional[str] = None
    rule_versions_snapshot: Dict[str, Any] = {}
    total_findings: int
    critical_findings: int
    major_findings: int
    minor_findings: int
    info_findings: int
    status: str
    summary: Optional[str] = None
    started_at: datetime
    completed_at: datetime
    findings: List[FindingResponse] = []

    class Config:
        from_attributes = True

class ValidationExecuteRequest(BaseModel):
    force_revalidation: bool = False
