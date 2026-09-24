export type CheckpointKey = 'entry' | 'sem1' | 'sem2';
export type ViewMode = 'observe' | 'simulate' | 'cohort' | 'model' | 'data';
export type TerrainMode = 'density' | 'uncertainty' | 'dropout' | 'graduate';

export interface CheckpointProbability {
  dropout: number;
  enrolled: number;
  graduate: number;
}

export interface CheckpointData {
  coords: [number, number, number];
  probas: CheckpointProbability;
  pred: string;
}

export interface FeatureContribution {
  name: string;
  val: number;
  contrib: number;
}

export interface StudentMetadata {
  age: number;
  gender: string;
  scholarship: boolean;
  debtor: boolean;
  tuition_ok: boolean;
  sem1_approved: number;
  sem2_approved: number;
}

export interface StudentDetail {
  id: number;
  target: 'Dropout' | 'Enrolled' | 'Graduate' | string;
  cluster_id: number;
  cluster_title: string;
  uncertainty: number;
  position: [number, number, number];
  checkpoints: {
    entry: CheckpointData;
    sem1: CheckpointData;
    sem2: CheckpointData;
  };
  top_features: FeatureContribution[];
  metadata: StudentMetadata;
}

export interface CohortPoint {
  id: number;
  t: string;
  c: number;
  u: number;
  p: [number, number, number];
  pg: number;
  pd: number;
}

export interface ArchetypeProfile {
  cluster_id: number;
  title: string;
  student_count: number;
  pct_dropout: number;
  pct_graduate: number;
  avg_admission_grade: number;
  avg_sem1_approved: number;
  avg_sem2_approved: number;
  pct_scholarship: number;
}

export interface SimulationDelta {
  delta_dropout: number;
  delta_enrolled: number;
  delta_graduate: number;
}

export interface SimulationBranch {
  id: string;
  branch_name: string;
  changed_variables: Record<string, any>;
  observed_probas: CheckpointProbability;
  simulated_probas: CheckpointProbability;
  deltas: SimulationDelta;
  observed_coords: [number, number, number];
  simulated_coords: [number, number, number];
  predicted_class: string;
  dominant_driving_feature: string;
}

export interface TerrainData {
  grid_size: number;
  density: number[][];
  uncertainty: number[][];
  dropout_conc: number[][];
  graduate_conc: number[][];
}

export interface DemoArchetype {
  student_id: number;
  demo_case: 'A' | 'B' | 'C';
  title: string;
  narrative: string;
  profile: StudentDetail;
}
