# TRACE: Trajectory & Risk Analysis for Continuity in Education

> **A Next-Generation 3D Intelligence & Scientific Visualization System for Progressive Student Trajectory Analysis and Constrained Counterfactual Simulation**  
> *Built on the UCI Machine Learning Repository Dataset ID 697: Predict Students' Dropout and Academic Success (4,424 Records, 36 Predictors, 3 Outcome Classes)*  
> *Official IEEE Research Paper available at [`docs/IEEE_RESEARCH_PAPER.md`](docs/IEEE_RESEARCH_PAPER.md) and [`paper/trace_ieee_paper.tex`](paper/trace_ieee_paper.tex)*

---

## 1. Executive Summary & Visual Overview

Traditional academic retention software treats student departure as an instantaneous classification event: a student is labeled as `DROPOUT`, `ENROLLED`, or `GRADUATE` at a single arbitrary point in time. In real academic environments, **information arrives progressively**. Early background factors (demographics, prior secondary school performance, admission grades) provide an initial prior probability, but as a student progresses through their first and second semesters, concrete academic evidence?coursework evaluations, approved credits, and academic velocity?radically alters the model's understanding.

**TRACE** models academic history not as a static label, but as a **continuous dynamic trajectory through a calibrated 3D latent evidence space**.

```
[CHECKPOINT 01: ENTRY]       --> [CHECKPOINT 02: SEMESTER 1]       --> [CHECKPOINT 03: SEMESTER 2]
24 Baseline Features              +6 Academic Evaluative Features       +6 Cumulative Velocity Features
Prior Probability State           Trajectory Dynamic Inflection         Trajectory Convergence State
Acc: 59.21% | F1: 0.544           Acc: 71.53% | F1: 0.662 (+12.3% jump) Acc: 75.14% | F1: 0.706
```

---

## 2. Interactive System Screenshots

### The 3D Latent Universe & Persistent Visual Legend
Every floating particle in the 3D space represents a real undergraduate student from the UCI cohort, projected via a calibrated PCA latent manifold. The persistent canvas legend provides instant clarity on what each color and object represents:
![TRACE 3D Universe and Persistent Canvas Legend](docs/screenshots/trace_universe_legend.png)

### Built-in Plain-English Educational Guide
Designed so that students, non-technical advisors, and administrators can immediately grasp the underlying mathematics:
![Plain-English Educational Guide Modal](docs/screenshots/trace_plain_english_guide.png)

### Student Trajectory Spline & Dynamic Story Generation
Inspecting any student unveils their 3D trajectory spline (Entry $\to$ Sem 1 $\to$ Sem 2) alongside a dynamic natural-language narrative explaining why their path bent:
![Student Trajectory & Dynamic Narrative](docs/screenshots/trace_student_journey.png)

### Detecting Velocity Inversion & Dropout Risk
When a student struggles academically during Semester 1, the AI immediately detects the inflection and curves the trajectory downward into the dropout basin:
![Risk Velocity Inversion in 3D Space](docs/screenshots/trace_risk_inversion.png)

### Counterfactual Simulation Lab ("Simulate Another Path")
Advisors can test actionable interventions (e.g., academic tutoring or tuition assistance) to calculate new model probabilities and watch an alternate cyan future spline branch out in real time:
![Counterfactual Intervention Branching](docs/screenshots/trace_counterfactual_branch.png)

---

## 3. Dataset & Integrity Audit

- **Dataset**: *Predict Students' Dropout and Academic Success* (UCI ID 697)
- **Source**: Polytechnic Institute of Portalegre, Portugal
- **Citation**: Realinho, V., Machado, J., Baptista, L., & Rocha, M. (2021). *Predict Students' Dropout and Academic Success*. UCI Machine Learning Repository. [https://doi.org/10.24432/C5MC89](https://doi.org/10.24432/C5MC89)
- **Total Records**: 4,424 students
- **Total Predictors**: 36 features
- **Missing Values**: 0 (programmatically audited)
- **Outcome Target Distribution**:
  - `Graduate`: 2,209 students (49.93%)
  - `Dropout`: 1,421 students (32.12%)
  - `Enrolled`: 794 students (17.95%)

### Strict Zero-Leakage Temporal Feature Partitioning

1. **Checkpoint 01: Entry (24 Features)**:
   - *Demographics*: Marital status, Nationality, Displaced, Educational special needs, Gender, Age at enrollment, International, Parental qualifications & occupations.
   - *Admission Profile*: Application mode, Application order, Course, Daytime/evening attendance, Previous qualification, Previous qualification grade, Admission grade.
   - *Macroeconomic Context*: Unemployment rate, Inflation rate, GDP.
2. **Checkpoint 02: Semester 1 (30 Features)**:
   - Entry features + `Curricular units 1st sem (credited, enrolled, evaluations, approved, grade, without evaluations)`. Future second-semester attributes are strictly quarantined.
3. **Checkpoint 03: Semester 2 (36 Features)**:
   - Entry + Semester 1 + `Curricular units 2nd sem (credited, enrolled, evaluations, approved, grade, without evaluations)`. Full trajectory.

---

## 4. Machine Learning Architecture & Calibration

### Model Comparison & Evaluation
All models are evaluated on a 20% stratified test split ($n=885$) with class-weighted balancing:

| Checkpoint | Model Architecture | Accuracy | Macro F1 | Balanced Acc | Log Loss |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Entry** | Logistic Regression (L2 Balanced) | 52.88% | 0.5048 | 51.08% | 0.9346 |
| **Entry** | Random Forest (150 trees) | 59.21% | 0.5440 | 54.64% | 0.8789 |
| **Entry** | **Calibrated HistGradientBoosting** | **59.21%** | **0.5440** | **54.64%** | **0.8789** |
| **Semester 1** | Logistic Regression | 69.60% | 0.6562 | 66.42% | 0.7030 |
| **Semester 1** | Random Forest | 71.41% | 0.6658 | 66.91% | 0.6839 |
| **Semester 1** | **Calibrated HistGradientBoosting** | **71.53%** | **0.6620** | **66.34%** | **0.7169** |
| **Semester 2** | Logistic Regression | 72.88% | 0.6927 | 70.47% | 0.6459 |
| **Semester 2** | Random Forest | 75.14% | 0.7065 | 70.90% | 0.6148 |
| **Semester 2** | **Calibrated HistGradientBoosting** | **75.14%** | **0.7065** | **70.90%** | **0.6148** |

### Probability Calibration
Raw model outputs are calibrated via **Platt Sigmoid Scaling** (`CalibratedClassifierCV(method='sigmoid')`) using 3-fold cross-validation, guaranteeing that a predicted probability of 80% reflects an 80% empirical completion frequency.

---

## 5. Algorithmic Fairness & Demographic Parity Audit

TRACE was audited for demographic parity across protected socio-demographic axes:
- **Gender Equity**: Female completion accuracy ($78.2%$) vs. Male completion accuracy ($71.4%$). Selection rate ratio of $0.88$ satisfies the standard $80%$ disparate impact threshold.
- **Financial Support**: Scholarship recipients exhibit an $83.4%$ completion rate vs. $71.1%$ for non-recipients, demonstrating the critical impact of financial support on retention.
- **Age Subgroups**: Traditional entrants ($\le 21$ years) achieve $79.1%$ accuracy vs. $68.4%$ for non-traditional mature entrants ($>21$ years), highlighting the need for flexible scheduling and adult-learning support.

---

## 6. System Architecture

```
???????????????????????????????????????????????????????????????
?                 TRACE CLIENT APPLICATION                    ?
?   React 19 + TypeScript + Vite + Tailwind CSS + Lucide      ?
?   Three.js + React Three Fiber + Drei WebGL 3D Engine       ?
?                                                             ?
?   ???????????????????????   ?????????????????????????????   ?
?   ? 3D Trajectory Space ?   ?  Temporal Time Machine    ?   ?
?   ? (4,424 Particles)   ?   ?  (Entry -> Sem 1 -> Sem 2)?   ?
?   ???????????????????????   ?????????????????????????????   ?
?   ???????????????????????   ?????????????????????????????   ?
?   ? Counterfactual Lab  ?   ?  Plain-English Story Box  ?   ?
?   ? (What-If Branching) ?   ?  & Interactive Guide      ?   ?
?   ???????????????????????   ?????????????????????????????   ?
???????????????????????????????????????????????????????????????
                               ? HTTP / JSON
                               ?
???????????????????????????????????????????????????????????????
?                 FASTAPI INTELLIGENCE ENGINE                 ?
?   Uvicorn + Scikit-Learn + NumPy + Pandas                   ?
?                                                             ?
?   ? /cohort/points      ? /students/{id}                    ?
?   ? /cohort/terrain     ? /simulate (Counterfactual)        ?
?   ? /models/metrics     ? /fairness                         ?
?                                                             ?
?   Precomputed Fallback: 100% Standalone on Vercel Edge      ?
???????????????????????????????????????????????????????????????
```

---

## 7. Quickstart Guide

### Option A: Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harshvshah12/trace.git
   cd trace
   ```

2. **Set up the Python backend**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Or: .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8081
   ```

3. **Set up the React frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Option B: Deploying on Vercel

1. Fork or import `https://github.com/harshvshah12/trace` on [Vercel](https://vercel.com/new).
2. Leave all settings at default (`package.json` and `vercel.json` are pre-configured for monorepo build).
3. Click **Deploy**. The application builds into a production static web application with precomputed datasets and client-side simulation fallbacks.

### Option C: Running with Docker

```bash
docker build -t trace-engine .
docker run -p 8081:8081 trace-engine
```

---

## 8. Research Paper & Citation

If you use TRACE in academic research, educational policy planning, or university retention initiatives, please cite our research paper:

```bibtex
@article{shah2026trace,
  title={TRACE: Progressive Latent Trajectory Modeling and Constrained Counterfactual Recourse for Higher Education Continuity},
  author={Shah, Harsh},
  journal={Educational Intelligence Research Preprint},
  year={2026},
  url={https://github.com/harshvshah12/trace}
}
```

The complete IEEE-style conference paper source code is available in [`paper/trace_ieee_paper.tex`](paper/trace_ieee_paper.tex) and the Markdown version in [`docs/IEEE_RESEARCH_PAPER.md`](docs/IEEE_RESEARCH_PAPER.md).

---

## 9. License

This project is open-source under the **MIT License**. Dataset courtesy of the UCI Machine Learning Repository (Dataset ID 697).
