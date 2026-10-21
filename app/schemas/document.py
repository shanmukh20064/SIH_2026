from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class ExtractedFieldResponse(BaseModel):
    id: str
    document_id: str
    field_name: str
    extracted_value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: float
    source_page: int
    raw_text_snippet: Optional[str] = None
    bounding_box: Optional[Any] = None
    is_inferred: bool
    reviewer_corrected_value: Optional[str] = None
    reviewed_by_user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractedFieldOverrideRequest(BaseModel):
    field_name: str
    corrected_value: str
    reviewer_notes: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    application_id: str
    document_type: str
    original_filename: str
    storage_filename: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    is_scanned: bool
    page_count: int
    processing_status: str
    upload_timestamp: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    extracted_fields: List[ExtractedFieldResponse] = []
