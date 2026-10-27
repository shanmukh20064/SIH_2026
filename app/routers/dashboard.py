from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.application import Application
from app.models.institution import Institution
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
    app_query = db.query(Application)
    doc_query = db.query(Document)
    finding_query = db.query(Finding)

    if current_user.role == "institution":
        inst = None
        if hasattr(current_user, "institution_id") and current_user.institution_id:
            inst = db.query(Institution).filter(Institution.id == current_user.institution_id).first()
        if not inst:
            inst = db.query(Institution).filter(Institution.institution_code == "AICTE-1-10928374").first() or db.query(Institution).first()
        
        if inst:
            app_query = app_query.filter(Application.institution_id == inst.id)
            doc_query = doc_query.join(Application).filter(Application.institution_id == inst.id)
            finding_query = finding_query.join(Application).filter(Application.institution_id == inst.id)

    total_apps = app_query.count()
    pending_apps = app_query.filter(Application.status.in_(["SUBMITTED", "IN_SCRUTINY"])).count()
    deficiency_apps = app_query.filter(Application.status == "DEFICIENCY_ISSUED").count()
    approved_apps = app_query.filter(Application.status == "APPROVED").count()
    rejected_apps = app_query.filter(Application.status == "REJECTED").count()

    total_docs = doc_query.count()
    total_findings = finding_query.count()

    # Severity distribution
    sev_counts = finding_query.with_entities(Finding.severity, func.count(Finding.id)).group_by(Finding.severity).all()
    sev_dict = {"CRITICAL": 0, "MAJOR": 0, "MINOR": 0, "INFO": 0}
    for s, c in sev_counts:
        sev_dict[s] = c

    # Status distribution
    status_counts = finding_query.with_entities(Finding.review_status, func.count(Finding.id)).group_by(Finding.review_status).all()
    status_dict = {"FLAGGED": 0, "CONFIRMED": 0, "RESOLVED": 0, "DISMISSED": 0, "NEEDS_ADDITIONAL_EVIDENCE": 0}
    for st, c in status_counts:
        status_dict[st] = c

    # Recent activity from audit log
    audit_query = db.query(AuditEvent)
    if current_user.role == "institution":
        audit_query = audit_query.filter((AuditEvent.user_id == current_user.id) | (AuditEvent.username == current_user.username))
    recent_events = audit_query.order_by(AuditEvent.timestamp.desc()).limit(8).all()
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

