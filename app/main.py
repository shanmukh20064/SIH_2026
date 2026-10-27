from pathlib import Path
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, get_db
from app.services.extractor import is_tesseract_available
from app.services.rules import seed_default_rules
from app.routers import (
    auth_router,
    institutions_router,
    applications_router,
    documents_router,
    validation_router,
    findings_router,
    rules_router,
    verification_router,
    dashboard_router,
    audit_router
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="SIH 2026 AI-Powered Regulatory Scrutiny, Document Authentication & Compliance Verification Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Endpoint
@app.get("/api/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    ocr_available = is_tesseract_available()

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "database_connected": db_ok,
        "ocr_available": ocr_available,
        "environment": settings.ENVIRONMENT,
        "notes": "System fully operational." if ocr_available else "System operational. Note: Local Tesseract binary not detected; scanned documents will be routed to manual reviewer inspection."
    }

# Open Storage Folder in Windows File Explorer
@app.get("/api/open-storage", tags=["Storage"])
def open_storage_folder():
    import os, platform, subprocess
    storage_path = str(settings.STORAGE_DIR.resolve())
    if not os.path.exists(storage_path):
        os.makedirs(storage_path, exist_ok=True)
    try:
        if platform.system() == "Windows":
            os.startfile(storage_path)
        else:
            subprocess.Popen(["xdg-open", storage_path])
        return {"status": "success", "message": "Storage folder opened in File Explorer", "path": storage_path}
    except Exception as e:
        return {"status": "error", "message": str(e), "path": storage_path}

# List Storage Files
@app.get("/api/storage/files", tags=["Storage"])
def list_storage_files():
    import os
    results = []
    storage_path = settings.STORAGE_DIR
    if storage_path.exists():
        for root, dirs, files in os.walk(storage_path):
            for f in files:
                full_p = Path(root) / f
                rel_p = full_p.relative_to(storage_path)
                results.append({
                    "name": f,
                    "rel_path": str(rel_p).replace("\\", "/"),
                    "size_bytes": full_p.stat().st_size,
                    "folder": str(rel_p.parent).replace("\\", "/"),
                    "modified": full_p.stat().st_mtime
                })
    return {"files": results, "total": len(results)}

# Register API Routers
app.include_router(auth_router)
app.include_router(institutions_router)
app.include_router(applications_router)
app.include_router(documents_router)
app.include_router(validation_router)
app.include_router(findings_router)
app.include_router(rules_router)
app.include_router(verification_router)
app.include_router(dashboard_router)
app.include_router(audit_router)

# Seed rules on startup
@app.on_event("startup")
def on_startup():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_default_rules(db)
    finally:
        db.close()

# Mount frontend directory for SPA static assets (prefer root dist, then frontend/dist)
ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist"
if not DIST_DIR.exists():
    DIST_DIR = ROOT_DIR / "frontend" / "dist"
if not DIST_DIR.exists():
    DIST_DIR = ROOT_DIR / "frontend"

if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="frontend")
