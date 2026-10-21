import io
from app.models.institution import Institution

def test_valid_pdf_upload(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    res_app = client.post(
        "/api/applications",
        json={"institution_id": inst.id, "category": "EXTENSION_OF_APPROVAL", "academic_year": "2026-2027"},
        headers=auth_headers
    )
    app_id = res_app.json()["id"]

    # Synthetic valid PDF
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    files = {"file": ("test_doc.pdf", pdf_content, "application/pdf")}
    data = {"document_type": "FIRE_SAFETY_NOC"}

    res_upload = client.post(
        f"/api/applications/{app_id}/documents",
        data=data,
        files=files,
        headers=auth_headers
    )
    assert res_upload.status_code == 201
    doc_data = res_upload.json()
    assert doc_data["document_type"] == "FIRE_SAFETY_NOC"
    assert doc_data["mime_type"] == "application/pdf"
    assert len(doc_data["sha256_hash"]) == 64

def test_unsupported_file_extension(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    res_app = client.post(
        "/api/applications",
        json={"institution_id": inst.id, "category": "EXTENSION_OF_APPROVAL", "academic_year": "2026-2027"},
        headers=auth_headers
    )
    app_id = res_app.json()["id"]

    files = {"file": ("malware.exe", b"MZexecutabledata", "application/octet-stream")}
    data = {"document_type": "FIRE_SAFETY_NOC"}

    res_upload = client.post(
        f"/api/applications/{app_id}/documents",
        data=data,
        files=files,
        headers=auth_headers
    )
    assert res_upload.status_code == 400
    assert "Unsupported file extension" in res_upload.json()["detail"]

def test_empty_file_upload(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    res_app = client.post(
        "/api/applications",
        json={"institution_id": inst.id, "category": "EXTENSION_OF_APPROVAL", "academic_year": "2026-2027"},
        headers=auth_headers
    )
    app_id = res_app.json()["id"]

    files = {"file": ("empty.pdf", b"", "application/pdf")}
    data = {"document_type": "FIRE_SAFETY_NOC"}

    res_upload = client.post(
        f"/api/applications/{app_id}/documents",
        data=data,
        files=files,
        headers=auth_headers
    )
    assert res_upload.status_code == 400

def test_corrupt_pdf_magic_bytes(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    res_app = client.post(
        "/api/applications",
        json={"institution_id": inst.id, "category": "EXTENSION_OF_APPROVAL", "academic_year": "2026-2027"},
        headers=auth_headers
    )
    app_id = res_app.json()["id"]

    # File named .pdf but lacking %PDF- magic bytes
    files = {"file": ("fake.pdf", b"NOT_A_REAL_PDF_HEADER", "application/pdf")}
    data = {"document_type": "FIRE_SAFETY_NOC"}

    res_upload = client.post(
        f"/api/applications/{app_id}/documents",
        data=data,
        files=files,
        headers=auth_headers
    )
    assert res_upload.status_code == 400
    assert "Invalid PDF" in res_upload.json()["detail"]
