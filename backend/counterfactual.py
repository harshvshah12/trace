import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'data.csv')

# Load models and transformers once
sem2_model = joblib.load(os.path.join(MODELS_DIR, 'sem2_model.joblib'))
global_scaler = joblib.load(os.path.join(MODELS_DIR, 'global_scaler.joblib'))
pca_3d = joblib.load(os.path.join(MODELS_DIR, 'pca_3d.joblib'))
coord_scales = joblib.load(os.path.join(MODELS_DIR, 'pca_scales.joblib'))

df = pd.read_csv(DATA_PATH, sep=';')
df.columns = [c.strip() for c in df.columns]

target_names = ['Dropout', 'Enrolled', 'Graduate']

def run_counterfactual_simulation(
    student_id: int,
    changes: Dict[str, Any],
    branch_name: str = 'Path A'
) -> Dict[str, Any]:
    idx = student_id - 1
    if idx < 0 or idx >= len(df):
        raise ValueError(f"Student ID {student_id} out of bounds.")
    
    orig_row = df.iloc[idx].copy()
    sim_row = orig_row.copy()
    
    changed_vars = {}
    
    if 'sem1_approved' in changes and changes['sem1_approved'] is not None:
        sim_row['Curricular units 1st sem (approved)'] = float(changes['sem1_approved'])
        changed_vars['1st Sem Approved'] = changes['sem1_approved']
        
    if 'sem1_grade' in changes and changes['sem1_grade'] is not None:
        sim_row['Curricular units 1st sem (grade)'] = float(changes['sem1_grade'])
        changed_vars['1st Sem Grade'] = changes['sem1_grade']
        
    if 'sem2_approved' in changes and changes['sem2_approved'] is not None:
        sim_row['Curricular units 2nd sem (approved)'] = float(changes['sem2_approved'])
        changed_vars['2nd Sem Approved'] = changes['sem2_approved']
        
    if 'sem2_grade' in changes and changes['sem2_grade'] is not None:
        sim_row['Curricular units 2nd sem (grade)'] = float(changes['sem2_grade'])
        changed_vars['2nd Sem Grade'] = changes['sem2_grade']
        
    if 'tuition_ok' in changes and changes['tuition_ok'] is not None:
        val = 1 if changes['tuition_ok'] else 0
        sim_row['Tuition fees up to date'] = val
        changed_vars['Tuition Paid'] = 'Yes' if val == 1 else 'No'
        
    if 'scholarship' in changes and changes['scholarship'] is not None:
        val = 1 if changes['scholarship'] else 0
        sim_row['Scholarship holder'] = val
        changed_vars['Scholarship'] = 'Yes' if val == 1 else 'No'
        
    ENTRY_FEATURES = [
        'Marital status', 'Application mode', 'Application order', 'Course',
        'Daytime/evening attendance', 'Previous qualification', 'Previous qualification (grade)',
        'Nacionality', "Mother's qualification", "Father's qualification",
        "Mother's occupation", "Father's occupation", 'Admission grade', 'Displaced',
        'Educational special needs', 'Debtor', 'Tuition fees up to date', 'Gender',
        'Scholarship holder', 'Age at enrollment', 'International',
        'Unemployment rate', 'Inflation rate', 'GDP'
    ]
    SEM1_NEW_FEATURES = [
        'Curricular units 1st sem (credited)',
        'Curricular units 1st sem (enrolled)',
        'Curricular units 1st sem (evaluations)',
        'Curricular units 1st sem (approved)',
        'Curricular units 1st sem (grade)',
        'Curricular units 1st sem (without evaluations)'
    ]
    SEM2_NEW_FEATURES = [
        'Curricular units 2nd sem (credited)',
        'Curricular units 2nd sem (enrolled)',
        'Curricular units 2nd sem (evaluations)',
        'Curricular units 2nd sem (approved)',
        'Curricular units 2nd sem (grade)',
        'Curricular units 2nd sem (without evaluations)'
    ]
    ALL_FEATURES = ENTRY_FEATURES + SEM1_NEW_FEATURES + SEM2_NEW_FEATURES
    
    orig_vec = orig_row[ALL_FEATURES].values.astype(float).reshape(1, -1)
    sim_vec = sim_row[ALL_FEATURES].values.astype(float).reshape(1, -1)
    
    orig_proba = sem2_model.predict_proba(orig_vec)[0]
    sim_proba = sem2_model.predict_proba(sim_vec)[0]
    
    orig_coords_raw = pca_3d.transform(global_scaler.transform(orig_vec))[0]
    orig_coords = ((orig_coords_raw / coord_scales) * 42.0).tolist()
    
    sim_coords_raw = pca_3d.transform(global_scaler.transform(sim_vec))[0]
    sim_coords = ((sim_coords_raw / coord_scales) * 42.0).tolist()
    
    pred_idx = int(np.argmax(sim_proba))
    
    dominant_feat = "Academic Coursework Velocity"
    if 'sem2_approved' in changes or 'sem1_approved' in changes:
        dominant_feat = "Approved Curricular Credits"
    elif 'tuition_ok' in changes:
        dominant_feat = "Tuition Administrative Standing"
    elif 'sem2_grade' in changes or 'sem1_grade' in changes:
        dominant_feat = "Semester Grade Average"
        
    return {
        'student_id': student_id,
        'branch_name': branch_name,
        'changed_variables': changed_vars,
        'observed_probas': {
            'dropout': round(float(orig_proba[0]), 3),
            'enrolled': round(float(orig_proba[1]), 3),
            'graduate': round(float(orig_proba[2]), 3)
        },
        'simulated_probas': {
            'dropout': round(float(sim_proba[0]), 3),
            'enrolled': round(float(sim_proba[1]), 3),
            'graduate': round(float(sim_proba[2]), 3)
        },
        'deltas': {
            'delta_dropout': round(float(sim_proba[0] - orig_proba[0]), 3),
            'delta_enrolled': round(float(sim_proba[1] - orig_proba[1]), 3),
            'delta_graduate': round(float(sim_proba[2] - orig_proba[2]), 3)
        },
        'observed_coords': [round(float(c), 2) for c in orig_coords],
        'simulated_coords': [round(float(c), 2) for c in sim_coords],
        'predicted_class': target_names[pred_idx],
        'dominant_driving_feature': dominant_feat
    }
