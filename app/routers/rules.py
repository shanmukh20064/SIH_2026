from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.rule import ComplianceRule
from app.models.user import User
from app.schemas.rule import RuleCreate, RuleUpdate, RuleResponse
from app.dependencies import get_current_user, require_role
from app.services.rules import get_all_rules, get_rule_by_code, update_rule
from app.services.audit import log_audit_event

router = APIRouter(prefix="/api/rules", tags=["Compliance Rules"])

@router.get("", response_model=List[RuleResponse])
def list_compliance_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_rules(db)

@router.post("", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
def create_compliance_rule(
    payload: RuleCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    existing = get_rule_by_code(db, payload.rule_code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rule with code '{payload.rule_code}' already exists."
        )

    rule = ComplianceRule(**payload.dict())
    db.add(rule)
    db.commit()
    db.refresh(rule)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="RULE_CREATED",
        resource_type="rule",
        resource_id=rule.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={"rule_code": rule.rule_code, "version": rule.version}
    )

    return rule

@router.patch("/{rule_code}", response_model=RuleResponse)
def update_compliance_rule(
    rule_code: str,
    payload: RuleUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    rule = update_rule(db, rule_code, payload.dict(exclude_unset=True))
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule '{rule_code}' not found.")

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="RULE_UPDATED",
        resource_type="rule",
        resource_id=rule.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={"rule_code": rule.rule_code, "new_version": rule.version}
    )

    return rule
