def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "test_admin", "password": "TestPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    assert data["username"] == "test_admin"

def test_login_failure_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "test_admin", "password": "WrongPassword"}
    )
    assert response.status_code == 401

def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "nobody", "password": "AnyPassword"}
    )
    assert response.status_code == 401

def test_me_endpoint_with_valid_token(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "test_reviewer"
    assert data["role"] == "reviewer"

def test_me_endpoint_without_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_admin_rbac_protection(client, applicant_headers, admin_headers):
    # Applicant tries to create compliance rule (forbidden)
    rule_payload = {
        "rule_code": "TEST-RULE-RBAC",
        "title": "Unauthorized Rule Creation",
        "category": "COMPLETENESS",
        "severity": "CRITICAL",
        "is_enabled": True,
        "description": "Test rule",
        "rule_config": {}
    }
    res_forbidden = client.post("/api/rules", json=rule_payload, headers=applicant_headers)
    assert res_forbidden.status_code == 403

    # Admin creates compliance rule (allowed)
    res_allowed = client.post("/api/rules", json=rule_payload, headers=admin_headers)
    assert res_allowed.status_code == 201

def test_cross_institution_isolation(client, applicant_headers, auth_headers, db_session):
    from app.models.institution import Institution
    from app.models.application import Application

    # Create another institution
    other_inst = Institution(
        institution_code="AICTE-1-OTHER888",
        name="OTHER STATE TECHNICAL UNIVERSITY",
        category="Engineering & Technology",
        state="Maharashtra",
        district="Mumbai",
        address="99 Sea Face Road"
    )
    db_session.add(other_inst)
    db_session.commit()

    other_app = Application(
        application_number="APP-OTHER-001",
        institution_id=other_inst.id,
        category="EXTENSION_OF_APPROVAL",
        academic_year="2026-2027",
        status="SUBMITTED"
    )
    db_session.add(other_app)
    db_session.commit()

    # Reviewer can view it
    res_reviewer = client.get(f"/api/applications/{other_app.id}", headers=auth_headers)
    assert res_reviewer.status_code == 200

    # Institution applicant from TEST999 attempts to view OTHER888 (forbidden)
    res_applicant = client.get(f"/api/applications/{other_app.id}", headers=applicant_headers)
    assert res_applicant.status_code == 403
    assert "Unauthorized" in res_applicant.json()["detail"]

def test_institution_dashboard_summary_scoping(client, applicant_headers):
    # Applicant receives dashboard summary scoped to their institution
    res = client.get("/api/dashboard/summary", headers=applicant_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_applications" in data
    assert "pending_scrutiny" in data

