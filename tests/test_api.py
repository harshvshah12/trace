import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["total_records"] == 4424

def test_dataset_summary():
    res = client.get("/dataset/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_students"] == 4424
    assert data["total_features"] == 36

def test_cohort_points():
    res = client.get("/cohort/points")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 4424
    assert len(data["points"]) == 4424

def test_cohort_terrain():
    res = client.get("/cohort/terrain")
    assert res.status_code == 200
    data = res.json()
    assert data["grid_size"] == 32
    assert len(data["density"]) == 32

def test_student_detail():
    res = client.get("/students/390")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 390
    assert "entry" in data["checkpoints"]
    assert "sem1" in data["checkpoints"]
    assert "sem2" in data["checkpoints"]

def test_simulation():
    res = client.post("/simulate", json={
        "student_id": 107,
        "sem2_approved": 6.0,
        "tuition_ok": True
    })
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == 107
    assert "deltas" in data
    assert "simulated_coords" in data
    assert data["deltas"]["delta_graduate"] > 0

def test_model_metrics():
    res = client.get("/models/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "entry" in data
    assert "sem1" in data
    assert "sem2" in data

def test_fairness():
    res = client.get("/fairness")
    assert res.status_code == 200
    data = res.json()
    assert "Gender" in data

def test_demo_students():
    res = client.get("/demo/students")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 3
