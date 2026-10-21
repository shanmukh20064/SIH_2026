from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.institution import Institution
from app.models.user import User
from app.schemas.institution import InstitutionCreate, InstitutionResponse, InstitutionUpdate
from app.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/institutions", tags=["Institutions"])

@router.get("", response_model=List[InstitutionResponse])
def list_institutions(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Institution)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Institution.name.ilike(pattern)) | (Institution.institution_code.ilike(pattern))
        )
    return query.offset(skip).limit(limit).all()

@router.post("", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
def create_institution(
    payload: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "reviewer"]))
):
    existing = db.query(Institution).filter(Institution.institution_code == payload.institution_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Institution with code '{payload.institution_code}' already exists."
        )

    institution = Institution(**payload.dict())
    db.add(institution)
    db.commit()
    db.refresh(institution)
    return institution

@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(
    institution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")
    return inst
