from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit import AuditEvent
from app.models.user import User
from app.schemas.audit import AuditEventResponse
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditEventResponse])
def get_audit_trail(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    query = db.query(AuditEvent)
    if action:
        query = query.filter(AuditEvent.action == action.upper())
    if resource_type:
        query = query.filter(AuditEvent.resource_type == resource_type.lower())

    return query.order_by(AuditEvent.timestamp.desc()).offset(skip).limit(limit).all()
