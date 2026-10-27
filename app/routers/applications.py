import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.models.institution import Institution
from app.models.document import Document
from app.models.validation import ValidationRun, Finding
from app.models.verification import VerificationAttempt
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationDetailResponse
)
from app.dependencies import get_current_user, require_role
from app.services.audit import log_audit_event
from app.services.reporter import generate_html_report, generate_csv_report, build_report_data

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    academic_year: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Application).join(Institution, Application.institution_id == Institution.id)

    if current_user.role == "institution":
        inst = None
        if hasattr(current_user, "institution_id") and current_user.institution_id:
            inst = db.query(Institution).filter(Institution.id == current_user.institution_id).first()
        if not inst:
            inst = db.query(Institution).filter(Institution.institution_code == "AICTE-1-10928374").first() or db.query(Institution).first()
        if inst:
            query = query.filter(Application.institution_id == inst.id)

    if status_filter:
        query = query.filter(Application.status == status_filter.upper())
    if category_filter:
        query = query.filter(Application.category == category_filter.upper())
    if academic_year:
        query = query.filter(Application.academic_year == academic_year)
    if search:
        pat = f"%{search}%"
        query = query.filter(
            (Application.application_number.ilike(pat)) |
            (Institution.name.ilike(pat)) |
            (Institution.institution_code.ilike(pat))
        )

    return query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inst = db.query(Institution).filter(Institution.id == payload.institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    # Generate sequential or unique application number
    count = db.query(Application).count() + 1
    app_number = f"APP-{datetime.now().year}-{count:04d}"

    app_obj = Application(
        application_number=app_number,
        institution_id=payload.institution_id,
        category=payload.category,
        academic_year=payload.academic_year,
        status="DRAFT",
        created_by_user_id=current_user.id
    )
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="APPLICATION_CREATED",
        resource_type="application",
        resource_id=app_obj.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={"application_number": app_number, "category": payload.category}
    )

    return app_obj

@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application_detail(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_obj = db.query(Application).filter(
        (Application.id == application_id) | (Application.application_number == application_id)
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found.")

    actual_app_id = app_obj.id

    if current_user.role == "institution":
        inst = None
        if hasattr(current_user, "institution_id") and current_user.institution_id:
            inst = db.query(Institution).filter(Institution.id == current_user.institution_id).first()
        if not inst:
            inst = db.query(Institution).filter(Institution.institution_code == "AICTE-1-10928374").first() or db.query(Institution).first()
        if inst and app_obj.institution_id != inst.id:
            raise HTTPException(status_code=403, detail="Unauthorized: Institution accounts can only access their own dossiers.")

    latest_val = db.query(ValidationRun).filter(
        ValidationRun.application_id == actual_app_id
    ).order_by(ValidationRun.completed_at.desc()).first()

    findings = []
    if latest_val:
        findings = db.query(Finding).filter(Finding.validation_run_id == latest_val.id).all()

    verifs = db.query(VerificationAttempt).filter(VerificationAttempt.application_id == actual_app_id).all()

    # Construct response
    resp = ApplicationDetailResponse(
        id=app_obj.id,
        application_number=app_obj.application_number,
        institution_id=app_obj.institution_id,
        category=app_obj.category,
        academic_year=app_obj.academic_year,
        status=app_obj.status,
        submission_date=app_obj.submission_date,
        created_at=app_obj.created_at,
        updated_at=app_obj.updated_at,
        institution=app_obj.institution,
        documents=app_obj.documents,
        latest_validation_run=latest_val,
        findings=findings,
        verification_attempts=verifs
    )
    return resp

@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    app_obj = db.query(Application).filter(
        (Application.id == application_id) | (Application.application_number == application_id)
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found.")

    old_status = app_obj.status
    if payload.status:
        valid_statuses = ["DRAFT", "SUBMITTED", "IN_SCRUTINY", "DEFICIENCY_ISSUED", "APPROVED", "REJECTED"]
        st = payload.status.upper()
        if st not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}'. Allowed: {valid_statuses}")
        app_obj.status = st
        if st == "SUBMITTED" and not app_obj.submission_date:
            app_obj.submission_date = datetime.now(timezone.utc)

    if payload.category:
        app_obj.category = payload.category.upper()
    if payload.academic_year:
        app_obj.academic_year = payload.academic_year

    db.commit()
    db.refresh(app_obj)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="APPLICATION_UPDATED",
        resource_type="application",
        resource_id=app_obj.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={"old_status": old_status, "new_status": app_obj.status}
    )

    return app_obj

@router.get("/{application_id}/reports")
def download_application_report(
    application_id: str,
    format: str = Query("html", pattern="^(html|json|csv)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_obj = db.query(Application).filter(
        (Application.id == application_id) | (Application.application_number == application_id)
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found.")

    if format == "json":
        data = build_report_data(application_id, db)
        return data
    elif format == "csv":
        csv_str = generate_csv_report(application_id, db)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=scrutiny-report-{app_obj.application_number}.csv"}
        )
    else:  # html
        html_str = generate_html_report(application_id, db)
        return Response(
            content=html_str,
            media_type="text/html",
            headers={"Content-Disposition": f"inline; filename=scrutiny-report-{app_obj.application_number}.html"}
        )
