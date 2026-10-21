from app.models.institution import Institution
from app.models.application import Application
from app.models.validation import ValidationRun, Finding
from app.models.audit import AuditEvent

def test_reviewer_finding_review_flow(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    app = Application(
        application_number="APP-TEST-REV-01",
        institution_id=inst.id,
        category="EXTENSION_OF_APPROVAL",
        academic_year="2026-2027",
        status="IN_SCRUTINY"
    )
    db_session.add(app)
    db_session.flush()

    val_run = ValidationRun(
        application_id=app.id,
        rule_versions_snapshot={},
        total_findings=1,
        critical_findings=1,
        status="SUCCESS"
    )
    db_session.add(val_run)
    db_session.flush()

    finding = Finding(
        validation_run_id=val_run.id,
        application_id=app.id,
        rule_code="RULE-DOC-MANDATORY",
        rule_version=1,
        severity="CRITICAL",
        title="Missing Fire NOC",
        explanation="Fire safety clearance is absent.",
        review_status="FLAGGED"
    )
    db_session.add(finding)
    db_session.commit()

    # Reviewer confirms finding with notes
    review_payload = {
        "review_status": "CONFIRMED",
        "reviewer_notes": "Verified against physical file records; Fire NOC is indeed absent."
    }
    res_review = client.post(
        f"/api/findings/{finding.id}/review",
        json=review_payload,
        headers=auth_headers
    )
    assert res_review.status_code == 200
    updated = res_review.json()
    assert updated["review_status"] == "CONFIRMED"
    assert updated["reviewer_notes"] == review_payload["reviewer_notes"]
    assert updated["reviewed_by_user_id"] is not None

def test_audit_log_tracking(client, auth_headers, db_session):
    res = client.get("/api/audit", headers=auth_headers)
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)
