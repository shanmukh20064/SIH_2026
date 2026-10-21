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
