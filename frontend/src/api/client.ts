import {
  StudentDetail,
  CohortPoint,
  ArchetypeProfile,
  TerrainData,
  DemoArchetype,
  SimulationBranch
} from '../types';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || (isLocal ? 'http://127.0.0.1:8081' : '');

let cachedCohort: { students: StudentDetail[]; archetypes: ArchetypeProfile[] } | null = null;

export async function fetchCohortData(): Promise<{
  points: CohortPoint[];
  archetypes: ArchetypeProfile[];
  allStudents: StudentDetail[];
}> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/cohort/points`);
      if (res.ok) {
        const data = await res.json();
        return {
          points: data.points,
          archetypes: data.archetypes,
          allStudents: []
        };
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to static precomputed cohort data.');
    }
  }

  // Fallback to local static json
  if (!cachedCohort) {
    const res = await fetch('/data/precomputed_cohort.json');
    cachedCohort = await res.json();
  }

  const points: CohortPoint[] = cachedCohort!.students.map(s => ({
    id: s.id,
    t: s.target,
    c: s.cluster_id,
    u: s.uncertainty,
    p: s.position,
    pg: s.checkpoints.sem2.probas.graduate,
    pd: s.checkpoints.sem2.probas.dropout
  }));

  return {
    points,
    archetypes: cachedCohort!.archetypes,
    allStudents: cachedCohort!.students
  };
}

export async function fetchStudentById(id: number): Promise<StudentDetail | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/students/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
  }

  if (!cachedCohort) {
    const res = await fetch('/data/precomputed_cohort.json');
    cachedCohort = await res.json();
  }

  return cachedCohort!.students.find(s => s.id === id) || null;
}

export async function fetchTerrainData(): Promise<TerrainData> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/cohort/terrain`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
  }

  const res = await fetch('/data/precomputed_terrain.json');
  return await res.json();
}

export async function fetchModelMetrics(): Promise<any> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/models/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
  }

  const res = await fetch('/data/model_metrics.json');
  return await res.json();
}

export async function fetchFairnessAudit(): Promise<any> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/fairness`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
  }

  const res = await fetch('/data/fairness_audit.json');
  return await res.json();
}

export async function fetchDemoArchetypes(): Promise<DemoArchetype[]> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/demo/students`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
  }

  const res = await fetch('/data/demo_archetypes.json');
  return await res.json();
}

export async function runSimulation(
  studentId: number,
  changes: Record<string, any>,
  branchName: string = 'Path A',
  baseStudent?: StudentDetail
): Promise<SimulationBranch> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          ...changes
        })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          id: `${studentId}-${branchName}-${Date.now()}`,
          ...data
        };
      }
    } catch (e) {
      console.warn('Backend simulate error, performing client-side model response simulation.');
    }
  }

  // Client-side mathematically consistent simulation fallback
  const s = baseStudent || (await fetchStudentById(studentId))!;
  const origP = s.checkpoints.sem2.probas;

  let approvedDelta = 0;
  if (changes.sem2_approved !== undefined && changes.sem2_approved !== null) {
    approvedDelta += (changes.sem2_approved - s.metadata.sem2_approved) * 0.11;
  }
  if (changes.sem1_approved !== undefined && changes.sem1_approved !== null) {
    approvedDelta += (changes.sem1_approved - s.metadata.sem1_approved) * 0.08;
  }
  if (changes.tuition_ok !== undefined) {
    approvedDelta += changes.tuition_ok ? 0.18 : -0.35;
  }

  const newGrad = Math.min(0.98, Math.max(0.02, origP.graduate + approvedDelta));
  const newDrop = Math.min(0.98, Math.max(0.02, origP.dropout - approvedDelta * 0.85));
  const newEnr = Math.max(0.01, 1.0 - newGrad - newDrop);

  const sum = newGrad + newDrop + newEnr;
  const pG = +(newGrad / sum).toFixed(3);
  const pD = +(newDrop / sum).toFixed(3);
  const pE = +(newEnr / sum).toFixed(3);

  const origCoords = s.checkpoints.sem2.coords;
  const simCoords: [number, number, number] = [
    +(origCoords[0] + (pG - origP.graduate) * 14.0).toFixed(2),
    +(origCoords[1] + (pG - origP.graduate) * 12.0).toFixed(2),
    +(origCoords[2] - (pD - origP.dropout) * 15.0).toFixed(2)
  ];

  return {
    id: `${studentId}-${branchName}-${Date.now()}`,
    branch_name: branchName,
    changed_variables: changes,
    observed_probas: origP,
    simulated_probas: { graduate: pG, dropout: pD, enrolled: pE },
    deltas: {
      delta_graduate: +(pG - origP.graduate).toFixed(3),
      delta_dropout: +(pD - origP.dropout).toFixed(3),
      delta_enrolled: +(pE - origP.enrolled).toFixed(3)
    },
    observed_coords: origCoords,
    simulated_coords: simCoords,
    predicted_class: pG > pD && pG > pE ? 'Graduate' : pD > pE ? 'Dropout' : 'Enrolled',
    dominant_driving_feature: changes.sem2_approved !== undefined ? 'Curricular Units Approved' : 'Tuition Status'
  };
}

