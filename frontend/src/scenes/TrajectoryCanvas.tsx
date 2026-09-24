import React, { useRef, useEffect, useState } from 'react';
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
import { Eye, Compass, Layers, Maximize2 } from 'lucide-react';

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

export type CameraPreset = 'default' | 'isometric' | 'top' | 'side' | 'front';

function CameraFlightController({
  selectedStudent,
  activeCheckpoint,
  showTerrain,
  resetViewTrigger,
  cameraPreset
}: {
  selectedStudent: StudentDetail | null;
  activeCheckpoint: CheckpointKey;
  showTerrain: boolean;
  resetViewTrigger: number;
  cameraPreset: CameraPreset;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const targetCam = useRef(new THREE.Vector3(0, 32, 72));
  const isTransitioning = useRef<boolean>(true);
  const transitionStart = useRef<number>(Date.now());

  // Trigger transition when selection, checkpoint, terrain, preset, or reset changes
  useEffect(() => {
    isTransitioning.current = true;
    transitionStart.current = Date.now();

    let lookX = 0, lookY = 0, lookZ = 0;
    if (selectedStudent) {
      const coords = selectedStudent.checkpoints[activeCheckpoint].coords;
      lookX = coords[0];
      lookY = coords[1];
      lookZ = coords[2];
    } else if (showTerrain) {
      lookY = -2;
    }

    targetLook.current.set(lookX, lookY, lookZ);

    if (cameraPreset === 'top') {
      targetCam.current.set(lookX, lookY + (selectedStudent ? 25 : 85), lookZ + 0.1);
    } else if (cameraPreset === 'side') {
      targetCam.current.set(lookX + (selectedStudent ? 22 : 80), lookY + 4, lookZ);
    } else if (cameraPreset === 'front') {
      targetCam.current.set(lookX, lookY + 6, lookZ + (selectedStudent ? 22 : 75));
    } else if (cameraPreset === 'isometric') {
      targetCam.current.set(lookX + (selectedStudent ? 16 : 55), lookY + (selectedStudent ? 14 : 50), lookZ + (selectedStudent ? 16 : 55));
    } else {
      // Default natural ergonomic angle
      if (selectedStudent) {
        targetCam.current.set(lookX + 11, lookY + 8, lookZ + 14);
      } else if (showTerrain) {
        targetCam.current.set(0, 48, 62);
      } else {
        targetCam.current.set(0, 30, 70);
      }
    }
  }, [selectedStudent, activeCheckpoint, showTerrain, resetViewTrigger, cameraPreset]);

  // Hook into OrbitControls events: as soon as the user starts dragging with mouse/touch,
  // immediately stop programmatic transition so controls never fight the user!
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onUserStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', onUserStart);
    return () => {
      controls.removeEventListener('start', onUserStart);
    };
  }, []);

  useFrame(() => {
    if (!isTransitioning.current) return;

    // Smoothly fly towards target
    camera.position.lerp(targetCam.current, 0.06);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.06);
      controlsRef.current.update();
    }

    // Stop flight once arrived or timeout exceeded
    const distCam = camera.position.distanceTo(targetCam.current);
    const distLook = controlsRef.current ? controlsRef.current.target.distanceTo(targetLook.current) : 0;
    const elapsed = Date.now() - transitionStart.current;

    if ((distCam < 0.15 && distLook < 0.15) || elapsed > 1500) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.85}
      panSpeed={0.8}
      zoomSpeed={1.0}
      screenSpacePanning={true}
      maxDistance={180}
      minDistance={4}
      maxPolarAngle={Math.PI - 0.05}
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
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');

  const currentPos = selectedStudent
    ? selectedStudent.checkpoints[activeCheckpoint].coords
    : ([0, 0, 0] as [number, number, number]);

  const currentProbas = selectedStudent
    ? selectedStudent.checkpoints[activeCheckpoint].probas
    : { graduate: 0.33, enrolled: 0.33, dropout: 0.33 };

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      {/* Perspective Angle Switcher Toolbar */}
      <div className="absolute top-20 left-4 z-30 flex items-center space-x-1 bg-obsidian-900/85 backdrop-blur-md border border-obsidian-700/60 rounded-xl p-1 shadow-xl font-mono text-[10px]">
        <span className="text-slate-400 px-2 flex items-center space-x-1">
          <Eye className="w-3 h-3 text-signal-cyan" />
          <span>ANGLE:</span>
        </span>
        {[
          { id: 'default', label: 'PERSPECTIVE' },
          { id: 'isometric', label: 'ISOMETRIC' },
          { id: 'top', label: 'TOP / PLAN' },
          { id: 'front', label: 'FRONT' },
          { id: 'side', label: 'SIDE' }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraPreset(p.id as CameraPreset)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              cameraPreset === p.id
                ? 'bg-signal-cyan/20 text-signal-cyan border border-signal-cyan/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Canvas
        camera={{ position: [0, 30, 70], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#07080b']} />

        {/* Ambient & Key Lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[25, 45, 25]} intensity={1.2} color="#f8fafc" />
        <pointLight position={[-25, 15, -25]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[25, -15, 25]} intensity={0.8} color="#10b981" />

        {/* Deep Field Atmosphere */}
        <Stars radius={120} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />

        {/* Spatial Coordinate Floor */}
        <Grid
          position={[0, -24, 0]}
          args={[140, 140]}
          cellSize={6}
          cellThickness={0.6}
          cellColor="#1e293b"
          sectionSize={24}
          sectionThickness={1.2}
          sectionColor="#334155"
          fadeDistance={95}
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

        {/* Decoupled Smooth Camera Flight & Unrestricted Orbit Controller */}
        <CameraFlightController
          selectedStudent={selectedStudent}
          activeCheckpoint={activeCheckpoint}
          showTerrain={showTerrain}
          resetViewTrigger={resetViewTrigger}
          cameraPreset={cameraPreset}
        />
      </Canvas>
    </div>
  );
};
