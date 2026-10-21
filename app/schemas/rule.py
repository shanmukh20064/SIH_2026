from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class RuleBase(BaseModel):
    rule_code: str
    title: str
    category: str
    severity: str = "CRITICAL"
    is_enabled: bool = True
    description: str
    rule_config: Dict[str, Any] = {}

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    is_enabled: Optional[bool] = None
    description: Optional[str] = None
    rule_config: Optional[Dict[str, Any]] = None

class RuleResponse(RuleBase):
    id: str
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
