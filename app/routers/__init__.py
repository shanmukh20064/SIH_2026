from app.routers.auth import router as auth_router
from app.routers.institutions import router as institutions_router
from app.routers.applications import router as applications_router
from app.routers.documents import router as documents_router
from app.routers.validation import router as validation_router
from app.routers.findings import router as findings_router
from app.routers.rules import router as rules_router
from app.routers.verification import router as verification_router
from app.routers.dashboard import router as dashboard_router
from app.routers.audit import router as audit_router

__all__ = [
    "auth_router",
    "institutions_router",
    "applications_router",
    "documents_router",
    "validation_router",
    "findings_router",
    "rules_router",
    "verification_router",
    "dashboard_router",
    "audit_router"
]
