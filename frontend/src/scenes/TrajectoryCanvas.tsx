import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CohortPoint, StudentDetail, CheckpointKey, TerrainData, TerrainMode, SimulationBranch } from '../types';
import { CohortParticles } from './CohortParticles';
import { StudentTrajectory } from './StudentTrajectory';
import { ProbabilityShells } from './ProbabilityShells';
import { FeatureConstellation } from './FeatureConstellation';
import { CounterfactualBranch } from './CounterfactualBranch';
import { CohortTerrain } from './CohortTerrain';

interface TrajectoryCanvasProps {
  points: CohortPoint[];
  selectedStudent: StudentDetail | null;
  onSelectStudent: (id: number) => void;
  hoveredStudentId: number | null;
  onHoverStudent: (id: number | null) => void;
  activeCheckpoint: CheckpointKey;
  onSelectCheckpoint: (cp: CheckpointKey) => void;
  showTerrain: boolean;
  terrainData: TerrainData | null;
  terrainMode: TerrainMode;
  simulationBranches: SimulationBranch[];
  activeBranchId: string | null;
  showConstellation: boolean;
  showGravities: boolean;
  filterOutcome: string | null;
  filterCluster: number | null;
  resetViewTrigger: number;
}

function CameraFlightController({
  selectedStudent,
  activeCheckpoint,
  showTerrain,
  resetViewTrigger
}: {
  selectedStudent: StudentDetail | null;
  activeCheckpoint: CheckpointKey;
  showTerrain: boolean;
  resetViewTrigger: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const targetCam = useRef(new THREE.Vector3(0, 32, 72));

  useEffect(() => {
    if (selectedStudent) {
      const coords = selectedStudent.checkpoints[activeCheckpoint].coords;
      targetLook.current.set(coords[0], coords[1], coords[2]);
      targetCam.current.set(coords[0] + 12, coords[1] + 8, coords[2] + 14);
    } else if (showTerrain) {
      targetLook.current.set(0, -2, 0);
      targetCam.current.set(0, 48, 62);
    } else {
      targetLook.current.set(0, 0, 0);
      targetCam.current.set(0, 32, 72);
    }
  }, [selectedStudent, activeCheckpoint, showTerrain, resetViewTrigger]);

  useFrame(() => {
    camera.position.lerp(targetCam.current, 0.04);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.04);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxDistance={140}
      minDistance={6}
      maxPolarAngle={Math.PI / 2 + 0.15}
    />
  );
}

export const TrajectoryCanvas: React.FC<TrajectoryCanvasProps> = ({
  points,
  selectedStudent,
  onSelectStudent,
  hoveredStudentId,
  onHoverStudent,
  activeCheckpoint,
  onSelectCheckpoint,
  showTerrain,
  terrainData,
  terrainMode,
  simulationBranches,
  activeBranchId,
  showConstellation,
  showGravities,
  filterOutcome,
  filterCluster,
  resetViewTrigger
}) => {
  const currentPos = selectedStudent
    ? selectedStudent.checkpoints[activeCheckpoint].coords
    : ([0, 0, 0] as [number, number, number]);

  const currentProbas = selectedStudent
    ? selectedStudent.checkpoints[activeCheckpoint].probas
    : { graduate: 0.33, enrolled: 0.33, dropout: 0.33 };

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 32, 72], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#07080b']} />

        {/* Ambient & Key Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[20, 40, 20]} intensity={1.2} color="#f8fafc" />
        <pointLight position={[-20, 10, -20]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[20, -10, 20]} intensity={0.8} color="#10b981" />

        {/* Deep Field Atmosphere */}
        <Stars radius={120} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />

        {/* Subtle Spatial Coordinate Floor */}
        <Grid
          position={[0, -24, 0]}
          args={[120, 120]}
          cellSize={6}
          cellThickness={0.6}
          cellColor="#1e293b"
          sectionSize={24}
          sectionThickness={1.2}
          sectionColor="#334155"
          fadeDistance={90}
          fadeStrength={1.5}
        />

        {/* 4,424 Cohort Student Particles */}
        <CohortParticles
          points={points}
          selectedStudentId={selectedStudent ? selectedStudent.id : null}
          onSelectStudent={onSelectStudent}
          hoveredStudentId={hoveredStudentId}
          onHoverStudent={onHoverStudent}
          showTerrain={showTerrain}
          filterOutcome={filterOutcome}
          filterCluster={filterCluster}
        />

        {/* 3D Topographic Terrain Landscape */}
        {showTerrain && <CohortTerrain data={terrainData} mode={terrainMode} />}

        {/* Selected Student Trajectory Spline */}
        {selectedStudent && (
          <StudentTrajectory
            student={selectedStudent}
            activeCheckpoint={activeCheckpoint}
            onSelectCheckpoint={onSelectCheckpoint}
          />
        )}

        {/* 3D Dynamic Probability Force Fields & Outcome Gravities */}
        {selectedStudent && (
          <ProbabilityShells
            position={currentPos}
            probas={currentProbas}
            showGravities={showGravities}
          />
        )}

        {/* Orbiting Feature Constellation */}
        {selectedStudent && showConstellation && (
          <FeatureConstellation
            center={currentPos}
            features={selectedStudent.top_features}
          />
        )}

        {/* Simulated Counterfactual Branches */}
        {selectedStudent && simulationBranches.length > 0 && (
          <CounterfactualBranch
            branches={simulationBranches}
            activeBranchId={activeBranchId}
          />
        )}

        {/* Cinematic Smooth Camera Controller */}
        <CameraFlightController
          selectedStudent={selectedStudent}
          activeCheckpoint={activeCheckpoint}
          showTerrain={showTerrain}
          resetViewTrigger={resetViewTrigger}
        />
      </Canvas>
    </div>
  );
};
