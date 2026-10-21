from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class InstitutionBase(BaseModel):
    institution_code: str
    name: str
    category: str = "Engineering & Technology"
    state: str
    district: str
    address: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None

class InstitutionResponse(InstitutionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
