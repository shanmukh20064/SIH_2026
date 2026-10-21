import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentDetailResponse, ExtractedFieldOverrideRequest
from app.dependencies import get_current_user, require_role
from app.services.storage import save_upload_file
from app.services.extractor import extract_document_content
from app.services.field_parser import parse_fields_from_pages
from app.services.audit import log_audit_event

router = APIRouter(tags=["Documents"])

@router.post("/api/applications/{application_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: str,
    request: Request,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_obj = db.query(Application).filter(Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found.")

    content = await file.read()
    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Secure save with magic byte check & SHA-256 calculation
    storage_filename, file_path, mime_type, file_size, sha256_hash = save_upload_file(
        original_filename=file.filename or "uploaded_file",
        content=content
    )

    # Ingest document record
    doc_record = Document(
        application_id=app_obj.id,
        document_type=document_type.strip(),
        original_filename=file.filename or "unknown",
        storage_filename=storage_filename,
        file_path=file_path,
        file_size_bytes=file_size,
        mime_type=mime_type,
        sha256_hash=sha256_hash,
        is_scanned=False,
        page_count=1,
        processing_status="PENDING",
        uploaded_by_user_id=current_user.id
    )
    db.add(doc_record)
    db.flush()

    # Extract content & structure
    extraction_res = extract_document_content(file_path, mime_type)
    doc_record.is_scanned = extraction_res.get("is_scanned", False)
    doc_record.page_count = extraction_res.get("page_count", 1)
    doc_record.processing_status = extraction_res.get("status", "EXTRACTED")

    # Parse key structured fields
    parsed_fields = parse_fields_from_pages(extraction_res.get("pages", []))
    for pf in parsed_fields:
        field_model = ExtractedField(
            document_id=doc_record.id,
            field_name=pf["field_name"],
            extracted_value=pf["extracted_value"],
            normalized_value=pf["normalized_value"],
            confidence=pf["confidence"],
            source_page=pf["source_page"],
            raw_text_snippet=pf["raw_text_snippet"],
            is_inferred=pf["is_inferred"]
        )
        db.add(field_model)

    db.commit()
    db.refresh(doc_record)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="DOCUMENT_UPLOAD",
        resource_type="document",
        resource_id=doc_record.id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={
            "filename": doc_record.original_filename,
            "document_type": doc_record.document_type,
            "sha256": sha256_hash,
            "extracted_fields_count": len(parsed_fields)
        }
    )

    return doc_record

@router.get("/api/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document_details(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.get("/api/documents/{document_id}/download")
def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on server.")

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=doc.original_filename
    )

@router.post("/api/documents/{document_id}/fields/{field_name}/override")
def override_extracted_field(
    document_id: str,
    field_name: str,
    payload: ExtractedFieldOverrideRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    field = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id,
        ExtractedField.field_name == field_name
    ).first()

    old_val = field.normalized_value if field else None

    if not field:
        # Create a new manual entry if field was previously unextracted
        field = ExtractedField(
            document_id=document_id,
            field_name=field_name,
            extracted_value=payload.corrected_value,
            normalized_value=payload.corrected_value,
            confidence=1.0,
            source_page=1,
            raw_text_snippet=f"Manually provided by reviewer: {payload.reviewer_notes or ''}",
            reviewer_corrected_value=payload.corrected_value,
            reviewed_by_user_id=current_user.id
        )
        db.add(field)
    else:
        field.reviewer_corrected_value = payload.corrected_value
        field.normalized_value = payload.corrected_value
        field.reviewed_by_user_id = current_user.id

    db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(
        db=db,
        action="FIELD_OVERRIDE",
        resource_type="document",
        resource_id=document_id,
        user_id=current_user.id,
        username=current_user.username,
        ip_address=client_ip,
        details={
            "field_name": field_name,
            "old_value": old_val,
            "corrected_value": payload.corrected_value,
            "notes": payload.reviewer_notes
        }
    )

    return {"status": "SUCCESS", "message": f"Field '{field_name}' successfully updated by reviewer."}
