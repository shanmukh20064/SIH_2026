from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.application import Application
from app.models.document import Document
from app.models.validation import Finding, ValidationRun
from app.models.audit import AuditEvent
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Analytics"])

@router.get("/summary", response_model=DashboardStatsResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_apps = db.query(Application).count()
    pending_apps = db.query(Application).filter(Application.status.in_(["SUBMITTED", "IN_SCRUTINY"])).count()
    deficiency_apps = db.query(Application).filter(Application.status == "DEFICIENCY_ISSUED").count()
    approved_apps = db.query(Application).filter(Application.status == "APPROVED").count()
    rejected_apps = db.query(Application).filter(Application.status == "REJECTED").count()

    total_docs = db.query(Document).count()
    total_findings = db.query(Finding).count()

    # Severity distribution
    sev_counts = db.query(Finding.severity, func.count(Finding.id)).group_by(Finding.severity).all()
    sev_dict = {"CRITICAL": 0, "MAJOR": 0, "MINOR": 0, "INFO": 0}
    for s, c in sev_counts:
        sev_dict[s] = c

    # Status distribution
    status_counts = db.query(Finding.review_status, func.count(Finding.id)).group_by(Finding.review_status).all()
    status_dict = {"FLAGGED": 0, "CONFIRMED": 0, "RESOLVED": 0, "DISMISSED": 0, "NEEDS_ADDITIONAL_EVIDENCE": 0}
    for st, c in status_counts:
        status_dict[st] = c

    # Recent activity from audit log
    recent_events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(8).all()
    recent_act = [
        {
            "action": e.action,
            "username": e.username or "System",
            "resource_type": e.resource_type,
            "resource_id": e.resource_id,
            "details": e.details,
            "timestamp": e.timestamp.isoformat()
        }
        for e in recent_events
    ]

    return DashboardStatsResponse(
        total_applications=total_apps,
        pending_scrutiny=pending_apps,
        applications_with_deficiencies=deficiency_apps,
        approved_applications=approved_apps,
        rejected_applications=rejected_apps,
        total_documents=total_docs,
        total_findings=total_findings,
        findings_by_severity=sev_dict,
        findings_by_status=status_dict,
        recent_activity=recent_act
    )
