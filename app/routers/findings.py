from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.validation import Finding
from app.models.user import User
from app.schemas.validation import FindingResponse, FindingReviewRequest
from app.dependencies import get_current_user, require_role
from app.services.audit import log_audit_event

router = APIRouter(prefix="/api/findings", tags=["Findings & Scrutiny Review"])

@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding_detail(
    finding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")
    return finding

@router.post("/{finding_id}/review", response_model=FindingResponse)
def review_finding(
    finding_id: str,
    payload: FindingReviewRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    valid_statuses = ["FLAGGED", "CONFIRMED", "DISMISSED", "RESOLVED", "NEEDS_ADDITIONAL_EVIDENCE"]
    new_status = payload.review_status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid review status. Allowed: {valid_statuses}")

    old_status = finding.review_status
    finding.review_status = new_status
    finding.reviewer_notes = payload.reviewer_notes
    finding.reviewed_by_user_id = current_user.id
    finding.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(finding)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="FINDING_REVIEWED",
        resource_type="finding",
        resource_id=finding.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={
            "rule_code": finding.rule_code,
            "old_status": old_status,
            "new_status": new_status,
            "notes": payload.reviewer_notes
        }
    )

    return finding
