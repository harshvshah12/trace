from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CheckpointProbability(BaseModel):
    dropout: float
    enrolled: float
    graduate: float

class CheckpointData(BaseModel):
    coords: List[float]
    probas: CheckpointProbability
    pred: str

class CheckpointMap(BaseModel):
    entry: CheckpointData
    sem1: CheckpointData
    sem2: CheckpointData

class FeatureContribution(BaseModel):
    name: str
    val: float
    contrib: float

class StudentMetadata(BaseModel):
    age: int
    gender: str
    scholarship: bool
    debtor: bool
    tuition_ok: bool
    sem1_approved: float
    sem2_approved: float

class StudentDetail(BaseModel):
    id: int
    target: str
    cluster_id: int
    cluster_title: str
    uncertainty: float
    position: List[float]
    checkpoints: CheckpointMap
    top_features: List[FeatureContribution]
    metadata: StudentMetadata

class CohortPoint(BaseModel):
    id: int
    target: str
    cluster_id: int
    uncertainty: float
    position: List[float]
    p_grad: float
    p_drop: float

class SimulationRequest(BaseModel):
    student_id: int
    sem1_approved: Optional[float] = Field(None, ge=0.0, le=15.0)
    sem1_grade: Optional[float] = Field(None, ge=0.0, le=20.0)
    sem2_approved: Optional[float] = Field(None, ge=0.0, le=15.0)
    sem2_grade: Optional[float] = Field(None, ge=0.0, le=20.0)
    tuition_ok: Optional[bool] = None
    scholarship: Optional[bool] = None

class SimulationDelta(BaseModel):
    delta_dropout: float
    delta_enrolled: float
    delta_graduate: float

class SimulationResponse(BaseModel):
    student_id: int
    branch_name: str
    changed_variables: Dict[str, Any]
    observed_probas: CheckpointProbability
    simulated_probas: CheckpointProbability
    deltas: SimulationDelta
    observed_coords: List[float]
    simulated_coords: List[float]
    predicted_class: str
    dominant_driving_feature: str
