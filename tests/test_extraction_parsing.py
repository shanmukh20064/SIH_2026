from app.services.field_parser import normalize_date, normalize_institution_id, parse_fields_from_pages
from app.services.extractor import extract_document_content
from scripts.generate_sample_docs import DEMO_DOCS_DIR

def test_date_normalization():
    # DD/MM/YYYY
    assert normalize_date("15/08/2025") == "2025-08-15"
    assert normalize_date("05-12-2024") == "2024-12-05"
    # ISO
    assert normalize_date("2026-07-31") == "2026-07-31"
    # Textual month
    assert normalize_date("15th August 2025") == "2025-08-15"
    assert normalize_date("August 15, 2025") == "2025-08-15"
    assert normalize_date("31-Mar-2027") == "2027-03-31"
    # Invalid
    assert normalize_date("Not a date") is None
    assert normalize_date("") is None

def test_institution_id_normalization():
    assert normalize_institution_id("aicte-1-10928374") == "AICTE-1-10928374"
    assert normalize_institution_id("  PID: 1-9988  ") == "PID1-9988"
    assert normalize_institution_id("X") is None  # Too short

def test_digital_pdf_text_extraction():
    sample_file = DEMO_DOCS_DIR / "clean_aicte_approval.pdf"
    res = extract_document_content(str(sample_file), "application/pdf")
    assert res["status"] == "EXTRACTED"
    assert res["is_scanned"] is False
    assert "APEX INSTITUTE OF TECHNOLOGY" in res["text"]
    assert "AICTE-1-10928374" in res["text"]

def test_structured_field_parsing():
    sample_text = """
    ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
    Certificate No: FS-NOC-2025-9911
    Permanent Institute Id: AICTE-1-10928374
    Institution Name: APEX INSTITUTE OF TECHNOLOGY
    Date of Issue: 15/05/2025
    Date of Expiry: 31/03/2027
    Issuing Authority: Fire and Emergency Services
    """
    pages = [{"page_number": 1, "text": sample_text}]
    fields = parse_fields_from_pages(pages)
    field_dict = {f["field_name"]: f for f in fields}

    assert "institution_id" in field_dict
    assert field_dict["institution_id"]["normalized_value"] == "AICTE-1-10928374"

    assert "certificate_number" in field_dict
    assert "FS-NOC-2025-9911" in field_dict["certificate_number"]["extracted_value"]

    assert "issue_date" in field_dict
    assert field_dict["issue_date"]["normalized_value"] == "2025-05-15"

    assert "expiry_date" in field_dict
    assert field_dict["expiry_date"]["normalized_value"] == "2027-03-31"

    assert "institution_name" in field_dict
    assert "APEX INSTITUTE OF TECHNOLOGY" in field_dict["institution_name"]["extracted_value"]
