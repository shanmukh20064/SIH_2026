from datetime import datetime, timezone
from app.models.institution import Institution
from app.models.application import Application
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.services.validator import execute_application_validation

def test_mandatory_documents_validation(db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    app = Application(
        application_number="APP-TEST-VAL-01",
        institution_id=inst.id,
        category="EXTENSION_OF_APPROVAL",
        academic_year="2026-2027",
        status="SUBMITTED"
    )
    db_session.add(app)
    db_session.commit()

    # Application has NO documents uploaded -> Should flag missing mandatory documents
    val_run = execute_application_validation(db_session, app.id)
    assert val_run.total_findings >= 3
    rule_codes = [f.rule_code for f in val_run.findings]
    assert "RULE-DOC-MANDATORY" in rule_codes
    assert val_run.critical_findings >= 1

def test_expired_certificate_validation(db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    app = Application(
        application_number="APP-TEST-VAL-02",
        institution_id=inst.id,
        category="EXTENSION_OF_APPROVAL",
        academic_year="2026-2027",
        status="SUBMITTED",
        submission_date=datetime(2026, 1, 15, tzinfo=timezone.utc)
    )
    db_session.add(app)
    db_session.commit()

    # Upload document with expired date (expired 2024-05-10)
    doc = Document(
        application_id=app.id,
        document_type="FIRE_SAFETY_NOC",
        original_filename="fire_noc.pdf",
        storage_filename="safe_fire_noc.pdf",
        file_path="/fake/path.pdf",
        file_size_bytes=1000,
        mime_type="application/pdf",
        sha256_hash="abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        is_scanned=False,
        processing_status="EXTRACTED"
    )
    db_session.add(doc)
    db_session.flush()

    exp_field = ExtractedField(
        document_id=doc.id,
        field_name="expiry_date",
        extracted_value="10/05/2024",
        normalized_value="2024-05-10",
        confidence=0.95,
        source_page=1
    )
    db_session.add(exp_field)
    db_session.commit()

    val_run = execute_application_validation(db_session, app.id)
    findings = [f for f in val_run.findings if f.rule_code == "RULE-CERT-EXPIRY"]
    assert len(findings) == 1
    assert findings[0].severity == "CRITICAL"
    assert "Expired Certificate" in findings[0].title

def test_cross_document_name_discrepancy(db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    app = Application(
        application_number="APP-TEST-VAL-03",
        institution_id=inst.id,
        category="NEW_COURSE",
        academic_year="2026-2027",
        status="SUBMITTED"
    )
    db_session.add(app)
    db_session.commit()

    # Document has substantially altered name
    doc = Document(
        application_id=app.id,
        document_type="LAND_TITLE_DEED",
        original_filename="land_title.pdf",
        storage_filename="safe_land_title.pdf",
        file_path="/fake/land.pdf",
        file_size_bytes=1000,
        mime_type="application/pdf",
        sha256_hash="1122334455667788990011223344556677889900112233445566778899001122",
        is_scanned=False,
        processing_status="EXTRACTED"
    )
    db_session.add(doc)
    db_session.flush()

    name_field = ExtractedField(
        document_id=doc.id,
        field_name="institution_name",
        extracted_value="GLOBAL PRIVATE REALTY TRUST",
        normalized_value="GLOBAL PRIVATE REALTY TRUST",
        confidence=0.9,
        source_page=1
    )
    db_session.add(name_field)
    db_session.commit()

    val_run = execute_application_validation(db_session, app.id)
    findings = [f for f in val_run.findings if f.rule_code == "RULE-CROSSDOC-NAME"]
    assert len(findings) == 1
    assert "Discrepancy" in findings[0].title

def test_rule_version_snapshotting(db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    app = Application(
        application_number="APP-TEST-VAL-04",
        institution_id=inst.id,
        category="CLOSURE",
        academic_year="2026-2027",
        status="SUBMITTED"
    )
    db_session.add(app)
    db_session.commit()

    val_run = execute_application_validation(db_session, app.id)
    assert isinstance(val_run.rule_versions_snapshot, dict)
    assert "RULE-DOC-MANDATORY" in val_run.rule_versions_snapshot
    assert val_run.rule_versions_snapshot["RULE-DOC-MANDATORY"] >= 1
