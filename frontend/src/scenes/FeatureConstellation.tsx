import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { FeatureContribution } from '../types';

interface FeatureConstellationProps {
  center: [number, number, number];
  features: FeatureContribution[];
  onSelectFeature?: (feature: FeatureContribution) => void;
}

export const FeatureConstellation: React.FC<FeatureConstellationProps> = ({
  center,
  features,
  onSelectFeature
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow continuous orbital rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });

  return (
    <group position={center} ref={groupRef}>
      {features.map((f, i) => {
        const angle = (i / features.length) * Math.PI * 2;
        // Distance mapped to contribution magnitude
        const dist = 3.6 + Math.abs(f.contrib) * 0.4;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = ((i % 3) - 1) * 1.2;

        const isPositive = f.contrib >= 0;
        const nodeColor = isPositive ? '#10b981' : '#ef4444';
        const nodeRadius = 0.3 + Math.min(0.5, Math.abs(f.contrib) * 0.08);

        return (
          <group key={f.name} position={[x, y, z]}>
            {/* Connection line to central student node */}
            <Line
              points={[[0, 0, 0], [-x, -y, -z]]}
              color={nodeColor}
              lineWidth={1}
              transparent
              opacity={0.35}
            />

            {/* Satellite Feature Star Node */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectFeature) onSelectFeature(f);
              }}
            >
              <dodecahedronGeometry args={[nodeRadius, 0]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Feature Label */}
            <Text
              position={[0, nodeRadius + 0.35, 0]}
              fontSize={0.35}
              color="#f8fafc"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.03}
              outlineColor="#090a0f"
            >
              {`${f.name} (${f.contrib > 0 ? '+' : ''}${f.contrib.toFixed(1)})`}
            </Text>
          </group>
        );
      })}
    </group>
  );
};
