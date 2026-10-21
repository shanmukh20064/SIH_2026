import hashlib
import os
import uuid
from pathlib import Path
from typing import Tuple, Optional
from fastapi import HTTPException, status
from app.config import settings

def compute_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def detect_mime_and_validate(filename: str, content: bytes) -> Tuple[str, str]:
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
        )

    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Magic byte inspection
    mime_type = "application/octet-stream"
    if ext == ".pdf":
        if not content.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file: Missing standard %PDF header magic bytes."
            )
        mime_type = "application/pdf"
    elif ext == ".png":
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PNG image: Corrupted or missing PNG header."
            )
        mime_type = "image/png"
    elif ext in [".jpg", ".jpeg"]:
        if not content.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JPEG image: Corrupted or missing JPEG header."
            )
        mime_type = "image/jpeg"
    elif ext == ".txt":
        try:
            content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                content.decode("latin-1")
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Text file contains unreadable non-text binary data."
                )
        mime_type = "text/plain"

    return ext, mime_type

def save_upload_file(original_filename: str, content: bytes) -> Tuple[str, str, str, int, str]:
    """
    Validates, computes SHA-256, and securely saves uploaded file.
    Returns: (storage_filename, file_path, mime_type, file_size_bytes, sha256_hash)
    """
    ext, mime_type = detect_mime_and_validate(original_filename, content)
    file_hash = compute_sha256(content)
    
    # Generate unique UUID-based safe storage filename
    storage_id = str(uuid.uuid4())
    safe_filename = f"{storage_id}{ext}"
    
    target_path = (settings.STORAGE_DIR / safe_filename).resolve()
    
    # Path traversal protection
    if not str(target_path).startswith(str(settings.STORAGE_DIR.resolve())):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Path traversal attempt detected."
        )

    with open(target_path, "wb") as f:
        f.write(content)

    return safe_filename, str(target_path), mime_type, len(content), file_hash
