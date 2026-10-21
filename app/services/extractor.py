import os
import shutil
from typing import Dict, Any, List, Optional
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
import pymupdf as fitz
from app.config import settings

def is_tesseract_available() -> bool:
    """Checks whether tesseract OCR binary is reachable on the system."""
    import pytesseract
    if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        return True
    
    # Check default path or system PATH
    found = shutil.which("tesseract")
    if found:
        return True
    
    # Standard Windows install paths
    win_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe")
    ]
    for p in win_paths:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            return True

    return False

def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """Enhance image contrast and clarity for OCR accuracy."""
    # Convert to grayscale
    gray = image.convert("L")
    # Autocontrast
    contrasted = ImageOps.autocontrast(gray)
    # Slight sharpening
    sharpened = contrasted.filter(ImageFilter.SHARPEN)
    return sharpened

def run_ocr_on_image(image: Image.Image) -> TupleResult:
    """Runs OCR on a PIL image if tesseract is available, otherwise returns status."""
    import pytesseract
    if not is_tesseract_available():
        return "", False, "OCR binary (tesseract) not found on host. Document requires manual review."
    try:
        processed = preprocess_image_for_ocr(image)
        text = pytesseract.image_to_string(processed)
        return text, True, None
    except Exception as e:
        return "", False, f"OCR processing error: {str(e)}"

class TupleResult:
    def __init__(self, text: str, success: bool, message: Optional[str] = None):
        self.text = text
        self.success = success
        self.message = message

def extract_document_content(file_path: str, mime_type: str) -> Dict[str, Any]:
    """
    Extracts text, metadata, page details from PDF, Image, or TXT file.
    Distinguishes digital PDFs from scanned PDFs.
    """
    result = {
        "text": "",
        "page_count": 1,
        "is_scanned": False,
        "ocr_used": False,
        "ocr_available": is_tesseract_available(),
        "pages": [],
        "pdf_metadata": {},
        "status": "EXTRACTED",
        "notes": []
    }

    path = Path(file_path)
    if not path.exists():
        result["status"] = "FAILED"
        result["notes"].append("File not found on disk.")
        return result

    if mime_type == "text/plain":
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            result["text"] = content
            result["page_count"] = 1
            result["pages"].append({"page_number": 1, "text": content, "char_count": len(content)})
            return result
        except Exception as e:
            result["status"] = "FAILED"
            result["notes"].append(f"Failed to read text file: {str(e)}")
            return result

    elif mime_type in ["image/png", "image/jpeg"]:
        result["is_scanned"] = True
        try:
            with Image.open(path) as img:
                ocr_text, ocr_success, msg = run_ocr_on_image(img)
                if ocr_success:
                    result["ocr_used"] = True
                    result["text"] = ocr_text
                    result["pages"].append({"page_number": 1, "text": ocr_text, "char_count": len(ocr_text)})
                else:
                    result["status"] = "MANUAL_REVIEW_NEEDED"
                    result["notes"].append(msg or "OCR unavailable for image document.")
            return result
        except Exception as e:
            result["status"] = "FAILED"
            result["notes"].append(f"Failed to open image file: {str(e)}")
            return result

    elif mime_type == "application/pdf":
        try:
            doc = fitz.open(str(path))
        except Exception as e:
            result["status"] = "FAILED"
            result["notes"].append(f"Corrupted or invalid PDF: {str(e)}")
            return result

        if doc.is_encrypted:
            result["status"] = "FAILED"
            result["notes"].append("Encrypted/Password-protected PDF. Cannot extract text without password.")
            doc.close()
            return result

        result["page_count"] = len(doc)
        result["pdf_metadata"] = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "creator": doc.metadata.get("creator", ""),
            "producer": doc.metadata.get("producer", ""),
            "creation_date": doc.metadata.get("creationDate", ""),
            "mod_date": doc.metadata.get("modDate", "")
        }

        total_extracted_text = []
        is_scanned_pdf = False
        low_text_pages = 0

        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_text = page.get_text() or ""
            char_count = len(page_text.strip())

            # If character count is very low, it could be a scanned page
            if char_count < 40:
                low_text_pages += 1

            total_extracted_text.append(page_text)
            result["pages"].append({
                "page_number": page_idx + 1,
                "text": page_text,
                "char_count": char_count
            })

        # Heuristic: If more than half the pages have < 40 chars and doc has pages
        if len(doc) > 0 and (low_text_pages / len(doc)) >= 0.5:
            is_scanned_pdf = True
            result["is_scanned"] = True

        combined_text = "\n".join(total_extracted_text)

        # If scanned PDF, attempt OCR on rendered pixmaps
        if is_scanned_pdf:
            if is_tesseract_available():
                ocr_pages_text = []
                for page_idx in range(len(doc)):
                    page = doc[page_idx]
                    pix = page.get_pixmap(dpi=150)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    ocr_t, ocr_ok, msg = run_ocr_on_image(img)
                    if ocr_ok:
                        ocr_pages_text.append(ocr_t)
                        result["pages"][page_idx]["text"] = ocr_t
                        result["pages"][page_idx]["char_count"] = len(ocr_t)
                if ocr_pages_text:
                    result["ocr_used"] = True
                    combined_text = "\n".join(ocr_pages_text)
            else:
                result["status"] = "MANUAL_REVIEW_NEEDED"
                result["notes"].append("Scanned PDF detected (low digital text density). OCR binary not configured on host; flagged for manual review.")

        doc.close()
        result["text"] = combined_text
        return result

    result["status"] = "FAILED"
    result["notes"].append(f"Unsupported MIME type: {mime_type}")
    return result
