import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { StudentDetail, CheckpointKey } from '../types';
import { createTrajectoryCurve, COLOR_GRADUATE, COLOR_DROPOUT, COLOR_ENROLLED, COLOR_CYAN } from '../lib/math3d';

interface StudentTrajectoryProps {
  student: StudentDetail | null;
  activeCheckpoint: CheckpointKey;
  onSelectCheckpoint: (cp: CheckpointKey) => void;
}

export const StudentTrajectory: React.FC<StudentTrajectoryProps> = ({
  student,
  activeCheckpoint,
  onSelectCheckpoint
}) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const pulseSphereRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    if (!student) return null;
    const { entry, sem1, sem2 } = student.checkpoints;
    return createTrajectoryCurve(entry.coords, sem1.coords, sem2.coords);
  }, [student]);

  const tubeGeo = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 64, 0.22, 12, false);
  }, [curve]);

  // Animated pulse traveling along the spline
  useFrame((state) => {
    if (!pulseSphereRef.current || !curve) return;
    const t = (state.clock.getElapsedTime() * 0.45) % 1;
    const pt = curve.getPointAt(t);
    pulseSphereRef.current.position.copy(pt);
  });

  if (!student || !curve || !tubeGeo) return null;

  const cps: { key: CheckpointKey; label: string; coords: [number, number, number]; prob: number }[] = [
    { key: 'entry', label: '01: ENTRY', coords: student.checkpoints.entry.coords, prob: student.checkpoints.entry.probas.graduate },
    { key: 'sem1', label: '02: SEMESTER 1', coords: student.checkpoints.sem1.coords, prob: student.checkpoints.sem1.probas.graduate },
    { key: 'sem2', label: '03: SEMESTER 2', coords: student.checkpoints.sem2.coords, prob: student.checkpoints.sem2.probas.graduate }
  ];

  return (
    <group>
      {/* 3D Catmull-Rom Trajectory Tube Spline */}
      <mesh ref={tubeRef} geometry={tubeGeo}>
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Traveling Energy Pulse Node */}
      <mesh ref={pulseSphereRef}>
        <sphereGeometry args={[0.36, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Checkpoint Nodes & Floating Analytical Tags */}
      {cps.map((cp) => {
        const isActive = activeCheckpoint === cp.key;
        const nodeColor = cp.prob > 0.6 ? COLOR_GRADUATE : cp.prob < 0.35 ? COLOR_DROPOUT : COLOR_ENROLLED;

        return (
          <group key={cp.key} position={cp.coords}>
            {/* Outer halo */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectCheckpoint(cp.key);
              }}
            >
              <sphereGeometry args={[isActive ? 0.9 : 0.6, 16, 16]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isActive ? 1.6 : 0.6}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing inner core */}
            {isActive && (
              <mesh>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshBasicMaterial
                  color={nodeColor}
                  wireframe
                  transparent
                  opacity={0.4}
                />
              </mesh>
            )}

            {/* 3D Checkpoint Label */}
            <Html position={[0, 1.4, 0]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
              <div
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono whitespace-nowrap font-bold shadow-xl backdrop-blur-md ${
                  isActive
                    ? 'bg-signal-cyan/25 border-signal-cyan text-signal-cyan'
                    : 'bg-obsidian-950/80 border-obsidian-800 text-slate-400'
                }`}
              >
                {cp.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
