def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "unhealthy"]
    assert data["database_connected"] is True
    assert "ocr_available" in data
    assert "version" in data

def test_openapi_docs_accessible(client):
    response = client.get("/docs")
    assert response.status_code == 200
