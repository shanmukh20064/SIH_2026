from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class VerificationAttemptResponse(BaseModel):
    id: str
    application_id: str
    document_id: str
    adapter_name: str
    external_reference: Optional[str] = None
    status: str
    response_payload: Dict[str, Any] = {}
    attempted_at: datetime

    class Config:
        from_attributes = True

class VerificationTriggerRequest(BaseModel):
    document_id: str
    adapter_name: Optional[str] = "MockAICTERegistryAdapter"
