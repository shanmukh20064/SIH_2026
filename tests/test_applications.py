from app.models.institution import Institution

def test_create_and_list_applications(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    
    # Create application
    payload = {
        "institution_id": inst.id,
        "category": "EXTENSION_OF_APPROVAL",
        "academic_year": "2026-2027"
    }
    res_create = client.post("/api/applications", json=payload, headers=auth_headers)
    assert res_create.status_code == 201
    created_app = res_create.json()
    assert created_app["category"] == "EXTENSION_OF_APPROVAL"
    assert created_app["status"] == "DRAFT"
    app_id = created_app["id"]

    # Retrieve application detail
    res_get = client.get(f"/api/applications/{app_id}", headers=auth_headers)
    assert res_get.status_code == 200
    assert res_get.json()["id"] == app_id

    # List applications
    res_list = client.get("/api/applications", headers=auth_headers)
    assert res_list.status_code == 200
    apps = res_list.json()
    assert len(apps) >= 1

def test_update_application_status(client, auth_headers, db_session):
    inst = db_session.query(Institution).filter(Institution.institution_code == "AICTE-1-TEST999").first()
    res_create = client.post(
        "/api/applications",
        json={"institution_id": inst.id, "category": "NEW_COURSE", "academic_year": "2026-2027"},
        headers=auth_headers
    )
    app_id = res_create.json()["id"]

    # Transition to SUBMITTED
    res_update = client.patch(
        f"/api/applications/{app_id}",
        json={"status": "SUBMITTED"},
        headers=auth_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "SUBMITTED"
    assert res_update.json()["submission_date"] is not None
