from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.verification import VerificationAttempt
from app.models.user import User
from app.schemas.verification import VerificationAttemptResponse, VerificationTriggerRequest
from app.dependencies import get_current_user, require_role
from app.services.verification import ADAPTER_REGISTRY
from app.services.audit import log_audit_event

router = APIRouter(prefix="/api/verification", tags=["Issuer Verification"])

@router.get("/adapters")
def list_available_adapters(current_user: User = Depends(get_current_user)):
    return [
        {
            "adapter_name": name,
            "issuer_name": adapter.issuer_name,
            "is_mock": True,
            "description": "Configurable simulated verification adapter for SIH demonstration."
        }
        for name, adapter in ADAPTER_REGISTRY.items()
    ]

@router.post("/verify", response_model=VerificationAttemptResponse, status_code=status.HTTP_201_CREATED)
def trigger_document_verification(
    payload: VerificationTriggerRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    doc = db.query(Document).filter(Document.id == payload.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    adapter_name = payload.adapter_name or "MockAICTERegistryAdapter"
    adapter = ADAPTER_REGISTRY.get(adapter_name)
    if not adapter:
        raise HTTPException(status_code=400, detail=f"Adapter '{adapter_name}' not registered.")

    # Fetch extracted cert number and institution name if available
    cert_field = db.query(ExtractedField).filter(
        ExtractedField.document_id == doc.id,
        ExtractedField.field_name == "certificate_number"
    ).first()
    cert_num = cert_field.normalized_value or cert_field.extracted_value if cert_field else None

    inst_field = db.query(ExtractedField).filter(
        ExtractedField.document_id == doc.id,
        ExtractedField.field_name == "institution_name"
    ).first()
    inst_name = inst_field.normalized_value or inst_field.extracted_value if inst_field else None

    res = adapter.verify(cert_number=cert_num, institution_name=inst_name, doc_type=doc.document_type)

    attempt = VerificationAttempt(
        application_id=doc.application_id,
        document_id=doc.id,
        adapter_name=adapter_name,
        external_reference=res.external_reference,
        status=res.status,
        response_payload=res.details
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="VERIFICATION_TRIGGERED",
        resource_type="document",
        resource_id=doc.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={
            "adapter": adapter_name,
            "status": res.status,
            "reference": res.external_reference
        }
    )

    return attempt
