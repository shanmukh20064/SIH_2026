from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.institution import InstitutionResponse
from app.schemas.document import DocumentResponse
from app.schemas.validation import ValidationRunResponse, FindingResponse
from app.schemas.verification import VerificationAttemptResponse

class ApplicationBase(BaseModel):
    category: str = "EXTENSION_OF_APPROVAL"
    academic_year: str = "2026-2027"

class ApplicationCreate(ApplicationBase):
    institution_id: str

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    academic_year: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: str
    application_number: str
    institution_id: str
    status: str
    submission_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    institution: Optional[InstitutionResponse] = None

    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    documents: List[DocumentResponse] = []
    latest_validation_run: Optional[ValidationRunResponse] = None
    findings: List[FindingResponse] = []
    verification_attempts: List[VerificationAttemptResponse] = []
