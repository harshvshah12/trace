import os
import json
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.schemas import (
    StudentDetail, CohortPoint, SimulationRequest, SimulationResponse
)
from backend.counterfactual import run_counterfactual_simulation

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')

app = FastAPI(
    title="TRACE Backend API",
    description="Trajectory & Risk Analysis for Continuity in Education API Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load precomputed datasets
with open(os.path.join(MODELS_DIR, 'precomputed_cohort.json'), 'r') as f:
    cohort_data = json.load(f)
    ALL_STUDENTS = cohort_data['students']
    ARCHETYPES = cohort_data['archetypes']

with open(os.path.join(MODELS_DIR, 'precomputed_terrain.json'), 'r') as f:
    TERRAIN_DATA = json.load(f)

with open(os.path.join(MODELS_DIR, 'model_metrics.json'), 'r') as f:
    MODEL_METRICS = json.load(f)

with open(os.path.join(MODELS_DIR, 'fairness_audit.json'), 'r') as f:
    FAIRNESS_DATA = json.load(f)

with open(os.path.join(MODELS_DIR, 'demo_archetypes.json'), 'r') as f:
    DEMO_ARCHETYPES = json.load(f)

STUDENT_LOOKUP = {s['id']: s for s in ALL_STUDENTS}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TRACE Intelligence Engine",
        "total_records": len(ALL_STUDENTS),
        "checkpoints_loaded": ["entry", "sem1", "sem2"]
    }

@app.get("/dataset/summary")
def get_dataset_summary():
    return {
        "dataset_name": "Predict Students' Dropout and Academic Success",
        "source": "UCI Machine Learning Repository (ID 697)",
        "total_students": len(ALL_STUDENTS),
        "total_features": 36,
        "checkpoints": {
            "entry": {"features_count": 24, "description": "Demographic, admission, prior qualification & economic indicators"},
            "sem1": {"features_count": 30, "description": "Entry + First-semester curricular credits, evaluations & approvals"},
            "sem2": {"features_count": 36, "description": "Entry + Sem 1 + Second-semester performance velocity"}
        },
        "target_distribution": {
            "Graduate": 2209,
            "Dropout": 1421,
            "Enrolled": 794
        }
    }

@app.get("/cohort/points")
def get_cohort_points():
    # Return compact coordinates and labels for fast 60fps GPU instanced rendering
    points = []
    for s in ALL_STUDENTS:
        points.append({
            "id": s["id"],
            "t": s["target"],
            "c": s["cluster_id"],
            "u": s["uncertainty"],
            "p": s["position"],
            "pg": s["checkpoints"]["sem2"]["probas"]["graduate"],
            "pd": s["checkpoints"]["sem2"]["probas"]["dropout"]
        })
    return {
        "count": len(points),
        "points": points,
        "archetypes": ARCHETYPES
    }

@app.get("/cohort/terrain")
def get_cohort_terrain():
    return TERRAIN_DATA

@app.get("/cohort/clusters")
def get_cohort_clusters():
    return ARCHETYPES

@app.get("/students")
def get_students(
    target: Optional[str] = Query(None),
    cluster_id: Optional[int] = Query(None),
    min_uncertainty: Optional[float] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    filtered = ALL_STUDENTS
    if target:
        filtered = [s for s in filtered if s['target'].lower() == target.lower()]
    if cluster_id is not None:
        filtered = [s for s in filtered if s['cluster_id'] == cluster_id]
    if min_uncertainty is not None:
        filtered = [s for s in filtered if s['uncertainty'] >= min_uncertainty]
        
    total = len(filtered)
    page = filtered[offset:offset + limit]
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "students": page
    }

@app.get("/students/{student_id}", response_model=StudentDetail)
def get_student_by_id(student_id: int):
    if student_id not in STUDENT_LOOKUP:
        raise HTTPException(status_code=404, detail=f"Student ID {student_id} not found.")
    return STUDENT_LOOKUP[student_id]

@app.post("/simulate", response_model=SimulationResponse)
def simulate_counterfactual(req: SimulationRequest):
    if req.student_id not in STUDENT_LOOKUP:
        raise HTTPException(status_code=404, detail=f"Student ID {req.student_id} not found.")
        
    changes = {
        'sem1_approved': req.sem1_approved,
        'sem1_grade': req.sem1_grade,
        'sem2_approved': req.sem2_approved,
        'sem2_grade': req.sem2_grade,
        'tuition_ok': req.tuition_ok,
        'scholarship': req.scholarship
    }
    
    try:
        res = run_counterfactual_simulation(req.student_id, changes)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/metrics")
def get_model_metrics():
    return MODEL_METRICS

@app.get("/fairness")
def get_fairness_audit():
    return FAIRNESS_DATA

@app.get("/demo/students")
def get_demo_students():
    return DEMO_ARCHETYPES
