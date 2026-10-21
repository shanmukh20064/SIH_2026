from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditEventResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: str
    details: Dict[str, Any] = {}
    timestamp: datetime

    class Config:
        from_attributes = True
