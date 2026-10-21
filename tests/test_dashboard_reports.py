from app.models.institution import Institution
from app.models.application import Application

def test_dashboard_summary_live_aggregation(client, auth_headers, db_session):
    res = client.get("/api/dashboard/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_applications" in data
    assert "findings_by_severity" in data
    assert "recent_activity" in data
    assert isinstance(data["findings_by_severity"], dict)

def test_download_application_reports(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    app = Application(
        application_number="APP-TEST-REP-01",
        institution_id=inst.id,
        category="EXTENSION_OF_APPROVAL",
        academic_year="2026-2027",
        status="SUBMITTED"
    )
    db_session.add(app)
    db_session.commit()

    # HTML Report
    res_html = client.get(f"/api/applications/{app.id}/reports?format=html", headers=auth_headers)
    assert res_html.status_code == 200
    assert "text/html" in res_html.headers["content-type"]
    assert "Regulatory Scrutiny" in res_html.text

    # JSON Report
    res_json = client.get(f"/api/applications/{app.id}/reports?format=json", headers=auth_headers)
    assert res_json.status_code == 200
    assert res_json.json()["application"]["application_number"] == "APP-TEST-REP-01"

    # CSV Report
    res_csv = client.get(f"/api/applications/{app.id}/reports?format=csv", headers=auth_headers)
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "APP-TEST-REP-01" in res_csv.text
