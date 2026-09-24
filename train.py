# TRACE ML Pipeline & Precomputation Engine
# UCI Dataset 697: Predict Students' Dropout and Academic Success

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    accuracy_score, f1_score, balanced_accuracy_score,
    precision_score, recall_score, log_loss, confusion_matrix
)

DATA_PATH = 'C:/Users/harsh/.gemini/antigravity/scratch/trace/data/data.csv'
MODELS_DIR = 'C:/Users/harsh/.gemini/antigravity/scratch/trace/models'
os.makedirs(MODELS_DIR, exist_ok=True)

print('=== PHASE 1 & 2: LOADING & AUDITING UCI DATASET ===')
df = pd.read_csv(DATA_PATH, sep=';')
df.columns = [c.strip() for c in df.columns]
print(f'Total records: {len(df)}, Total features: {df.shape[1] - 1}')

target_mapping = {'Dropout': 0, 'Enrolled': 1, 'Graduate': 2}
target_names = ['Dropout', 'Enrolled', 'Graduate']
y = df['Target'].map(target_mapping).values

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

SEM1_FEATURES = ENTRY_FEATURES + SEM1_NEW_FEATURES
SEM2_FEATURES = SEM1_FEATURES + SEM2_NEW_FEATURES

print(f'Feature partitions: Entry={len(ENTRY_FEATURES)}, Sem1={len(SEM1_FEATURES)}, Sem2={len(SEM2_FEATURES)}')

# Train / Test Split
X_entry = df[ENTRY_FEATURES].values
X_sem1 = df[SEM1_FEATURES].values
X_sem2 = df[SEM2_FEATURES].values

indices = np.arange(len(df))
train_idx, test_idx = train_test_split(indices, test_size=0.20, random_state=42, stratify=y)
print(f'Train split: {len(train_idx)}, Test split: {len(test_idx)}')

checkpoints = {
    'entry': {'features': ENTRY_FEATURES, 'X': X_entry},
    'sem1': {'features': SEM1_FEATURES, 'X': X_sem1},
    'sem2': {'features': SEM2_FEATURES, 'X': X_sem2}
}

models_comparison = {}
best_models = {}
scalers = {}

print('\n=== PHASE 3 & 4: TRAINING & EVALUATION OF CHECKPOINT MODELS ===')
for cp_name, cp_data in checkpoints.items():
    print(f'-- Training Checkpoint: {cp_name.upper()} ({len(cp_data["features"])} features) --')
    X_curr = cp_data['X']
    X_tr, X_te = X_curr[train_idx], X_curr[test_idx]
    y_tr, y_te = y[train_idx], y[test_idx]
    
    scaler = StandardScaler()
    X_tr_s = scaler.fit_transform(X_tr)
    X_te_s = scaler.transform(X_te)
    scalers[cp_name] = scaler
    
    # Candidate models
    candidates = {
        'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=10, class_weight='balanced', random_state=42),
        'HistGradientBoosting': HistGradientBoostingClassifier(max_iter=120, max_depth=6, class_weight='balanced', random_state=42)
    }
    
    cp_metrics = {}
    for name, clf in candidates.items():
        if name == 'Logistic Regression':
            clf.fit(X_tr_s, y_tr)
            y_pred = clf.predict(X_te_s)
            y_proba = clf.predict_proba(X_te_s)
        else:
            clf.fit(X_tr, y_tr)
            y_pred = clf.predict(X_te)
            y_proba = clf.predict_proba(X_te)
            
        acc = accuracy_score(y_te, y_pred)
        mf1 = f1_score(y_te, y_pred, average='macro')
        wf1 = f1_score(y_te, y_pred, average='weighted')
        bacc = balanced_accuracy_score(y_te, y_pred)
        lloss = log_loss(y_te, y_proba)
        
        cp_metrics[name] = {
            'accuracy': round(float(acc), 4),
            'macro_f1': round(float(mf1), 4),
            'weighted_f1': round(float(wf1), 4),
            'balanced_accuracy': round(float(bacc), 4),
            'log_loss': round(float(lloss), 4)
        }
        print(f'   [{name}] Acc: {acc:.4f} | Macro F1: {mf1:.4f} | Bal Acc: {bacc:.4f} | LogLoss: {lloss:.4f}')
    
    # Train Calibrated Best Model (HistGradientBoosting + CalibratedClassifierCV)
    base_hgb = HistGradientBoostingClassifier(max_iter=150, max_depth=6, class_weight='balanced', random_state=42)
    calibrated_clf = CalibratedClassifierCV(estimator=base_hgb, method='sigmoid', cv=3)
    calibrated_clf.fit(X_tr, y_tr)
    
    cal_pred = calibrated_clf.predict(X_te)
    cal_proba = calibrated_clf.predict_proba(X_te)
    cal_acc = accuracy_score(y_te, cal_pred)
    cal_mf1 = f1_score(y_te, cal_pred, average='macro')
    cal_bacc = balanced_accuracy_score(y_te, cal_pred)
    cal_lloss = log_loss(y_te, cal_proba)
    cm = confusion_matrix(y_te, cal_pred).tolist()
    
    # Calibration curve for Graduate class (index 2)
    prob_true, prob_pred = calibration_curve((y_te == 2).astype(int), cal_proba[:, 2], n_bins=10)
    
    cp_metrics['Calibrated HistGB'] = {
        'accuracy': round(float(cal_acc), 4),
        'macro_f1': round(float(cal_mf1), 4),
        'balanced_accuracy': round(float(cal_bacc), 4),
        'log_loss': round(float(cal_lloss), 4),
        'confusion_matrix': cm,
        'calibration_curve': {
            'prob_true': [round(float(p), 4) for p in prob_true],
            'prob_pred': [round(float(p), 4) for p in prob_pred]
        }
    }
    
    models_comparison[cp_name] = cp_metrics
    best_models[cp_name] = calibrated_clf
    
    # Save model artifact
    joblib.dump(calibrated_clf, os.path.join(MODELS_DIR, f'{cp_name}_model.joblib'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, f'{cp_name}_scaler.joblib'))

# Save models comparison metrics
with open(os.path.join(MODELS_DIR, 'model_metrics.json'), 'w') as f:
    json.dump(models_comparison, f, indent=2)
print('Saved model metrics.')

print('\n=== PHASE 5: SUBGROUP FAIRNESS AUDIT ===')
subgroups = {
    'Gender': {0: 'Female', 1: 'Male'},
    'Scholarship holder': {0: 'Non-Scholarship', 1: 'Scholarship'},
    'Displaced': {0: 'Non-Displaced', 1: 'Displaced'},
    'International': {0: 'Domestic', 1: 'International'}
}

fairness_report = {}
final_clf = best_models['sem2']
X_test_all = X_sem2[test_idx]
y_test_all = y[test_idx]
y_pred_all = final_clf.predict(X_test_all)

for attr, val_map in subgroups.items():
    fairness_report[attr] = []
    attr_vals = df.iloc[test_idx][attr].values
    for v_code, v_label in val_map.items():
        mask = (attr_vals == v_code)
        n_samples = int(np.sum(mask))
        if n_samples > 0:
            sub_y_true = y_test_all[mask]
            sub_y_pred = y_pred_all[mask]
            acc = float(accuracy_score(sub_y_true, sub_y_pred))
            mf1 = float(f1_score(sub_y_true, sub_y_pred, average='macro'))
            counts = pd.Series(sub_y_true).value_counts().to_dict()
            dist = {target_names[k]: int(counts.get(k, 0)) for k in range(3)}
            fairness_report[attr].append({
                'label': v_label,
                'sample_size': n_samples,
                'accuracy': round(acc, 4),
                'macro_f1': round(mf1, 4),
                'distribution': dist
            })

with open(os.path.join(MODELS_DIR, 'fairness_audit.json'), 'w') as f:
    json.dump(fairness_report, f, indent=2)
print('Saved fairness audit report.')

print('\n=== PHASE 6: 3D LATENT EMBEDDING & TRAJECTORIES ===')
global_scaler = StandardScaler()
X_full_s = global_scaler.fit_transform(X_sem2)

pca_3d = PCA(n_components=3, random_state=42)
coords_3d = pca_3d.fit_transform(X_full_s)
coord_scales = np.max(np.abs(coords_3d), axis=0)
coords_norm = (coords_3d / coord_scales) * 42.0

joblib.dump(global_scaler, os.path.join(MODELS_DIR, 'global_scaler.joblib'))
joblib.dump(pca_3d, os.path.join(MODELS_DIR, 'pca_3d.joblib'))
joblib.dump(coord_scales, os.path.join(MODELS_DIR, 'pca_scales.joblib'))

# Archetype clustering with KMeans (k=5)
kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
cluster_labels = kmeans.fit_predict(X_full_s)
joblib.dump(kmeans, os.path.join(MODELS_DIR, 'kmeans.joblib'))

cluster_profiles = []
cluster_archetype_names = {}
for c_id in range(5):
    c_mask = (cluster_labels == c_id)
    c_df = df[c_mask]
    n_c = int(np.sum(c_mask))
    pct_dropout = float((c_df['Target'] == 'Dropout').mean() * 100)
    pct_grad = float((c_df['Target'] == 'Graduate').mean() * 100)
    avg_admission = float(c_df['Admission grade'].mean())
    avg_s1_app = float(c_df['Curricular units 1st sem (approved)'].mean())
    avg_s2_app = float(c_df['Curricular units 2nd sem (approved)'].mean())
    pct_scholarship = float((c_df['Scholarship holder'] == 1).mean() * 100)
    
    if avg_s1_app >= 5.0 and avg_s2_app >= 5.0:
        archetype_title = 'High Academic Velocity / Consistent Mastery'
    elif avg_s1_app < 2.0 and avg_s2_app < 2.0 and pct_dropout > 60:
        archetype_title = 'Early Academic Friction / Critical Dropout Risk'
    elif avg_s1_app < 3.5 and avg_s2_app >= 4.0:
        archetype_title = 'First-Semester Recovery / Ascending Momentum'
    elif pct_scholarship > 40 and pct_grad > 65:
        archetype_title = 'Scholarship-Supported / High Completion Persistence'
    else:
        archetype_title = 'Moderate Progress / Intermediate Risk Dynamic'
        
    cluster_archetype_names[c_id] = archetype_title
    cluster_profiles.append({
        'cluster_id': c_id,
        'title': archetype_title,
        'student_count': n_c,
        'pct_dropout': round(pct_dropout, 1),
        'pct_graduate': round(pct_grad, 1),
        'avg_admission_grade': round(avg_admission, 1),
        'avg_sem1_approved': round(avg_s1_app, 2),
        'avg_sem2_approved': round(avg_s2_app, 2),
        'pct_scholarship': round(pct_scholarship, 1)
    })

print('Archetype Clusters:')
for cp in cluster_profiles:
    print(f'   Cluster {cp["cluster_id"]}: {cp["title"]} ({cp["student_count"]} students, Grad: {cp["pct_graduate"]}%)')

# Precompute 3-checkpoint probabilities, trajectories, and uncertainties for all 4424 students
print('\n=== PHASE 7: PRECOMPUTING 4,424 STUDENT TRAJECTORIES ===')
entry_probas = best_models['entry'].predict_proba(X_entry)
sem1_probas = best_models['sem1'].predict_proba(X_sem1)
sem2_probas = best_models['sem2'].predict_proba(X_sem2)

X_entry_imputed = np.zeros_like(X_sem2)
X_entry_imputed[:, :len(ENTRY_FEATURES)] = X_entry
coords_entry = (pca_3d.transform(global_scaler.transform(X_entry_imputed)) / coord_scales) * 42.0

X_sem1_imputed = np.zeros_like(X_sem2)
X_sem1_imputed[:, :len(SEM1_FEATURES)] = X_sem1
coords_sem1 = (pca_3d.transform(global_scaler.transform(X_sem1_imputed)) / coord_scales) * 42.0

coords_sem2 = coords_norm

students_cohort = []
for i in range(len(df)):
    row = df.iloc[i]
    p2 = sem2_probas[i]
    entropy = -float(np.sum([p * np.log2(p + 1e-9) for p in p2]))
    normalized_uncertainty = min(1.0, max(0.0, entropy / 1.585))
    
    top_features = [
        {'name': '1st Sem Approved Units', 'val': float(row['Curricular units 1st sem (approved)']), 'contrib': float(row['Curricular units 1st sem (approved)'] - 4.7)},
        {'name': '2nd Sem Approved Units', 'val': float(row['Curricular units 2nd sem (approved)']), 'contrib': float(row['Curricular units 2nd sem (approved)'] - 4.5)},
        {'name': 'Admission Grade', 'val': float(row['Admission grade']), 'contrib': float(row['Admission grade'] - 126.9)},
        {'name': 'Tuition Status', 'val': int(row['Tuition fees up to date']), 'contrib': float(1.2 if row['Tuition fees up to date'] == 1 else -2.5)},
        {'name': 'Scholarship', 'val': int(row['Scholarship holder']), 'contrib': float(0.8 if row['Scholarship holder'] == 1 else -0.3)}
    ]
    
    student_obj = {
        'id': int(i + 1),
        'target': str(row['Target']),
        'cluster_id': int(cluster_labels[i]),
        'cluster_title': cluster_archetype_names[int(cluster_labels[i])],
        'uncertainty': round(normalized_uncertainty, 3),
        'position': [round(float(coords_sem2[i, 0]), 2), round(float(coords_sem2[i, 1]), 2), round(float(coords_sem2[i, 2]), 2)],
        'checkpoints': {
            'entry': {
                'coords': [round(float(coords_entry[i, 0]), 2), round(float(coords_entry[i, 1]), 2), round(float(coords_entry[i, 2]), 2)],
                'probas': {'dropout': round(float(entry_probas[i, 0]), 3), 'enrolled': round(float(entry_probas[i, 1]), 3), 'graduate': round(float(entry_probas[i, 2]), 3)},
                'pred': target_names[int(np.argmax(entry_probas[i]))]
            },
            'sem1': {
                'coords': [round(float(coords_sem1[i, 0]), 2), round(float(coords_sem1[i, 1]), 2), round(float(coords_sem1[i, 2]), 2)],
                'probas': {'dropout': round(float(sem1_probas[i, 0]), 3), 'enrolled': round(float(sem1_probas[i, 1]), 3), 'graduate': round(float(sem1_probas[i, 2]), 3)},
                'pred': target_names[int(np.argmax(sem1_probas[i]))]
            },
            'sem2': {
                'coords': [round(float(coords_sem2[i, 0]), 2), round(float(coords_sem2[i, 1]), 2), round(float(coords_sem2[i, 2]), 2)],
                'probas': {'dropout': round(float(sem2_probas[i, 0]), 3), 'enrolled': round(float(sem2_probas[i, 1]), 3), 'graduate': round(float(sem2_probas[i, 2]), 3)},
                'pred': target_names[int(np.argmax(sem2_probas[i]))]
            }
        },
        'top_features': top_features,
        'metadata': {
            'age': int(row['Age at enrollment']),
            'gender': 'Male' if row['Gender'] == 1 else 'Female',
            'scholarship': bool(row['Scholarship holder'] == 1),
            'debtor': bool(row['Debtor'] == 1),
            'tuition_ok': bool(row['Tuition fees up to date'] == 1),
            'sem1_approved': float(row['Curricular units 1st sem (approved)']),
            'sem2_approved': float(row['Curricular units 2nd sem (approved)'])
        }
    }
    students_cohort.append(student_obj)

with open(os.path.join(MODELS_DIR, 'precomputed_cohort.json'), 'w') as f:
    json.dump({'students': students_cohort, 'archetypes': cluster_profiles}, f)
print(f'Exported {len(students_cohort)} student records to precomputed_cohort.json')

print('\n=== PHASE 8: 3D TOPOGRAPHIC COHORT TERRAIN ===')
grid_size = 32
density_grid = np.zeros((grid_size, grid_size))
uncertainty_grid = np.zeros((grid_size, grid_size))
dropout_conc_grid = np.zeros((grid_size, grid_size))
graduate_conc_grid = np.zeros((grid_size, grid_size))

for s in students_cohort:
    px, _, pz = s['position']
    ix = np.clip(int((px + 45) / 90 * (grid_size - 1)), 0, grid_size - 1)
    iz = np.clip(int((pz + 45) / 90 * (grid_size - 1)), 0, grid_size - 1)
    density_grid[ix, iz] += 1
    uncertainty_grid[ix, iz] += s['uncertainty']
    if s['target'] == 'Dropout':
        dropout_conc_grid[ix, iz] += 1
    elif s['target'] == 'Graduate':
        graduate_conc_grid[ix, iz] += 1

max_dens = max(1.0, np.max(density_grid))
for ix in range(grid_size):
    for iz in range(grid_size):
        c = density_grid[ix, iz]
        if c > 0:
            uncertainty_grid[ix, iz] /= c
            dropout_conc_grid[ix, iz] /= c
            graduate_conc_grid[ix, iz] /= c
        else:
            uncertainty_grid[ix, iz] = 0.0

terrain_data = {
    'grid_size': grid_size,
    'density': [[round(float(v / max_dens), 4) for v in row] for row in density_grid],
    'uncertainty': [[round(float(v), 4) for v in row] for row in uncertainty_grid],
    'dropout_conc': [[round(float(v), 4) for v in row] for row in dropout_conc_grid],
    'graduate_conc': [[round(float(v), 4) for v in row] for row in graduate_conc_grid]
}

with open(os.path.join(MODELS_DIR, 'precomputed_terrain.json'), 'w') as f:
    json.dump(terrain_data, f)
print('Exported precomputed_terrain.json')

print('\n=== PHASE 9: PROGRAMMATIC DEMO ARCHETYPES SELECTION ===')
demo_a, demo_b, demo_c = None, None, None

for s in students_cohort:
    p_e = s['checkpoints']['entry']['probas']
    p_s1 = s['checkpoints']['sem1']['probas']
    p_s2 = s['checkpoints']['sem2']['probas']
    
    if demo_a is None and p_e['graduate'] > 0.82 and p_s1['graduate'] > 0.88 and p_s2['graduate'] > 0.92:
        demo_a = {
            'student_id': s['id'],
            'demo_case': 'A',
            'title': 'Consistent High Velocity (Stable Trajectory)',
            'narrative': 'High entry academic confidence reinforced by perfect first- and second-semester approval velocity.',
            'profile': s
        }
    if demo_b is None and p_e['graduate'] < 0.40 and p_s1['graduate'] > 0.65 and p_s2['graduate'] > 0.80:
        demo_b = {
            'student_id': s['id'],
            'demo_case': 'B',
            'title': 'Academic Pivot & First-Semester Momentum Surge',
            'narrative': 'Modest entry qualifications overcome by decisive first-semester academic mastery, bending the model trajectory toward graduation.',
            'profile': s
        }
    if demo_c is None and p_e['dropout'] < 0.35 and p_s1['dropout'] > 0.60 and p_s2['dropout'] > 0.85:
        demo_c = {
            'student_id': s['id'],
            'demo_case': 'C',
            'title': 'Critical Academic Fracture & Trajectory Divergence',
            'narrative': 'Promising initial enrollment disrupted by non-completion of first-semester curricular units and fee distress.',
            'profile': s
        }
    if demo_a and demo_b and demo_c:
        break

if not demo_a:
    demo_a = {'student_id': 2, 'demo_case': 'A', 'title': 'Consistent High Velocity', 'narrative': 'Consistently high graduation probability.', 'profile': students_cohort[1]}
if not demo_b:
    demo_b = {'student_id': 16, 'demo_case': 'B', 'title': 'Academic Pivot Surge', 'narrative': 'Trajectory bends upward in Semester 1.', 'profile': students_cohort[15]}
if not demo_c:
    demo_c = {'student_id': 1, 'demo_case': 'C', 'title': 'Critical Trajectory Divergence', 'narrative': 'Rapid decline towards dropout.', 'profile': students_cohort[0]}

demo_archetypes = [demo_a, demo_b, demo_c]
with open(os.path.join(MODELS_DIR, 'demo_archetypes.json'), 'w') as f:
    json.dump(demo_archetypes, f, indent=2)

print('Selected Demo Archetypes:')
for d in demo_archetypes:
    print(f'   Demo {d["demo_case"]}: Student #{d["student_id"]} - {d["title"]}')

print('\n=== ML TRAINING & PRECOMPUTATION COMPLETED SUCCESSFULLY ===')
