import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { CheckpointProbability } from '../types';
import { OUTCOME_GRAVITIES, COLOR_GRADUATE, COLOR_DROPOUT, COLOR_ENROLLED } from '../lib/math3d';

interface ProbabilityShellsProps {
  position: [number, number, number];
  probas: CheckpointProbability;
  showGravities: boolean;
}

export const ProbabilityShells: React.FC<ProbabilityShellsProps> = ({
  position,
  probas,
  showGravities
}) => {
  const gradShellRef = useRef<THREE.Mesh>(null);
  const dropShellRef = useRef<THREE.Mesh>(null);
  const enrShellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (gradShellRef.current) {
      gradShellRef.current.rotation.y = t * 0.2;
      gradShellRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    }
    if (dropShellRef.current) {
      dropShellRef.current.rotation.x = t * -0.25;
    }
    if (enrShellRef.current) {
      enrShellRef.current.rotation.y = t * -0.15;
    }
  });

  const pGradRadius = 1.0 + probas.graduate * 2.8;
  const pDropRadius = 0.8 + probas.dropout * 2.4;
  const pEnrRadius = 0.6 + probas.enrolled * 2.0;

  const currentPos = new THREE.Vector3(...position);

  return (
    <group position={position}>
      {/* Graduate Probability Shell (Emerald) */}
      <mesh ref={gradShellRef}>
        <sphereGeometry args={[pGradRadius, 20, 20]} />
        <meshStandardMaterial
          color={COLOR_GRADUATE}
          emissive={COLOR_GRADUATE}
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.15 + probas.graduate * 0.35}
        />
      </mesh>

      {/* Dropout Probability Shell (Crimson) */}
      <mesh ref={dropShellRef}>
        <sphereGeometry args={[pDropRadius, 18, 18]} />
        <meshStandardMaterial
          color={COLOR_DROPOUT}
          emissive={COLOR_DROPOUT}
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.15 + probas.dropout * 0.35}
        />
      </mesh>

      {/* Enrolled Probability Shell (Amber) */}
      <mesh ref={enrShellRef}>
        <sphereGeometry args={[pEnrRadius, 16, 16]} />
        <meshStandardMaterial
          color={COLOR_ENROLLED}
          emissive={COLOR_ENROLLED}
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.12 + probas.enrolled * 0.3}
        />
      </mesh>

      {/* Outcome Gravities & Attractor Fields */}
      {showGravities && (
        <group position={[-position[0], -position[1], -position[2]]}>
          {/* Graduate Attractor */}
          <group position={OUTCOME_GRAVITIES.graduate}>
            <mesh>
              <octahedronGeometry args={[1.5, 0]} />
              <meshStandardMaterial color={COLOR_GRADUATE} emissive={COLOR_GRADUATE} emissiveIntensity={0.8} wireframe />
            </mesh>
            <Text position={[0, 2.2, 0]} fontSize={0.7} color="#10b981" anchorX="center">
              ATTRACTOR: GRADUATE
            </Text>
            <Line
              points={[currentPos, OUTCOME_GRAVITIES.graduate]}
              color="#10b981"
              lineWidth={1}
              dashed
              dashScale={2}
              dashSize={0.6}
              gapSize={0.4}
              transparent
              opacity={0.3 + probas.graduate * 0.5}
            />
          </group>

          {/* Dropout Attractor */}
          <group position={OUTCOME_GRAVITIES.dropout}>
            <mesh>
              <octahedronGeometry args={[1.5, 0]} />
              <meshStandardMaterial color={COLOR_DROPOUT} emissive={COLOR_DROPOUT} emissiveIntensity={0.8} wireframe />
            </mesh>
            <Text position={[0, 2.2, 0]} fontSize={0.7} color="#ef4444" anchorX="center">
              ATTRACTOR: DROPOUT
            </Text>
            <Line
              points={[currentPos, OUTCOME_GRAVITIES.dropout]}
              color="#ef4444"
              lineWidth={1}
              dashed
              dashScale={2}
              dashSize={0.6}
              gapSize={0.4}
              transparent
              opacity={0.3 + probas.dropout * 0.5}
            />
          </group>

          {/* Enrolled Attractor */}
          <group position={OUTCOME_GRAVITIES.enrolled}>
            <mesh>
              <octahedronGeometry args={[1.5, 0]} />
              <meshStandardMaterial color={COLOR_ENROLLED} emissive={COLOR_ENROLLED} emissiveIntensity={0.8} wireframe />
            </mesh>
            <Text position={[0, 2.2, 0]} fontSize={0.7} color="#f59e0b" anchorX="center">
              ATTRACTOR: ENROLLED
            </Text>
            <Line
              points={[currentPos, OUTCOME_GRAVITIES.enrolled]}
              color="#f59e0b"
              lineWidth={1}
              dashed
              dashScale={2}
              dashSize={0.6}
              gapSize={0.4}
              transparent
              opacity={0.3 + probas.enrolled * 0.5}
            />
          </group>
        </group>
      )}
    </group>
  );
};
