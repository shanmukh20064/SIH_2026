from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.models.validation import ValidationRun
from app.models.user import User
from app.schemas.validation import ValidationRunResponse, ValidationExecuteRequest
from app.dependencies import get_current_user, require_role
from app.services.validator import execute_application_validation
from app.services.audit import log_audit_event

router = APIRouter(prefix="/api/applications/{application_id}", tags=["Validation Engine"])

@router.post("/validate", response_model=ValidationRunResponse, status_code=status.HTTP_201_CREATED)
def trigger_application_validation(
    application_id: str,
    request: Request,
    payload: ValidationExecuteRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    app_obj = db.query(Application).filter(Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found.")

    validation_run = execute_application_validation(
        db=db,
        application_id=application_id,
        user_id=current_user.id
    )

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="VALIDATION_RUN",
        resource_type="application",
        resource_id=application_id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={
            "validation_run_id": validation_run.id,
            "total_findings": validation_run.total_findings,
            "critical_findings": validation_run.critical_findings
        }
    )

    return validation_run

@router.get("/validation-runs", response_model=List[ValidationRunResponse])
def list_validation_runs(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    runs = db.query(ValidationRun).filter(
        ValidationRun.application_id == application_id
    ).order_by(ValidationRun.completed_at.desc()).all()
    return runs
