import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app

client = TestClient(app)

def test_health_live():
    """Verify that the core API is alive and responding."""
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": None}
