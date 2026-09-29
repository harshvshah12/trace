import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { SimulationBranch } from '../types';
import { createBranchCurve, COLOR_CYAN, COLOR_VIOLET } from '../lib/math3d';

interface CounterfactualBranchProps {
  branches: SimulationBranch[];
  activeBranchId: string | null;
  onSelectBranch?: (id: string) => void;
}

export const CounterfactualBranch: React.FC<CounterfactualBranchProps> = ({
  branches,
  activeBranchId,
  onSelectBranch
}) => {
  return (
    <group>
      {branches.map((b, idx) => (
        <BranchItem
          key={b.id}
          branch={b}
          index={idx}
          isActive={activeBranchId === b.id}
          onSelect={onSelectBranch}
        />
      ))}
    </group>
  );
};

const BranchItem: React.FC<{
  branch: SimulationBranch;
  index: number;
  isActive: boolean;
  onSelect?: (id: string) => void;
}> = ({ branch, index, isActive, onSelect }) => {
  const pulseRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    return createBranchCurve(branch.observed_coords, branch.simulated_coords);
  }, [branch]);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.16, 8, false);
  }, [curve]);

  const branchColor = index % 2 === 0 ? COLOR_CYAN : COLOR_VIOLET;

  useFrame((state) => {
    if (!pulseRef.current || !curve) return;
    const t = (state.clock.getElapsedTime() * 0.6 + index * 0.3) % 1;
    pulseRef.current.position.copy(curve.getPointAt(t));
  });

  return (
    <group>
      {/* 3D Branch Tube */}
      <mesh
        geometry={tubeGeo}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(branch.id);
        }}
      >
        <meshStandardMaterial
          color={branchColor}
          emissive={branchColor}
          emissiveIntensity={isActive ? 1.2 : 0.6}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Traveling Energy Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Simulated Destination Node */}
      <group position={branch.simulated_coords}>
        <mesh>
          <sphereGeometry args={[isActive ? 0.8 : 0.55, 16, 16]} />
          <meshStandardMaterial
            color={branchColor}
            emissive={branchColor}
            emissiveIntensity={1.4}
            wireframe={!isActive}
          />
        </mesh>
        <Html position={[0, 1.3, 0]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-0.5 rounded-lg bg-obsidian-950/90 border border-signal-cyan/60 text-[10px] font-mono whitespace-nowrap font-bold text-signal-cyan shadow-xl backdrop-blur-md">
            {`${branch.branch_name}: ${branch.predicted_class} (ΔGrad: ${branch.deltas.delta_graduate > 0 ? '+' : ''}${(branch.deltas.delta_graduate * 100).toFixed(0)}%)`}
          </div>
        </Html>
      </group>
    </group>
  );
};
