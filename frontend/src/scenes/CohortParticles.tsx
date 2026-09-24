import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { CohortPoint } from '../types';
import { COLOR_GRADUATE, COLOR_DROPOUT, COLOR_ENROLLED, getProbabilityColor } from '../lib/math3d';

interface CohortParticlesProps {
  points: CohortPoint[];
  selectedStudentId: number | null;
  onSelectStudent: (id: number) => void;
  hoveredStudentId: number | null;
  onHoverStudent: (id: number | null) => void;
  showTerrain: boolean;
  filterOutcome: string | null;
  filterCluster: number | null;
}

export const CohortParticles: React.FC<CohortParticlesProps> = ({
  points,
  selectedStudentId,
  onSelectStudent,
  hoveredStudentId,
  onHoverStudent,
  showTerrain,
  filterOutcome,
  filterCluster
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = points.length;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize instance matrices and colors
  useEffect(() => {
    if (!meshRef.current || count === 0) return;

    for (let i = 0; i < count; i++) {
      const p = points[i];
      const isSelected = p.id === selectedStudentId;
      const isHovered = p.id === hoveredStudentId;

      let visible = true;
      if (filterOutcome && p.t.toLowerCase() !== filterOutcome.toLowerCase()) visible = false;
      if (filterCluster !== null && p.c !== filterCluster) visible = false;

      dummy.position.set(p.p[0], p.p[1], p.p[2]);

      // Base scale modulated by model certainty & selection
      let scale = visible ? 0.38 + (1 - p.u) * 0.28 : 0.001;
      if (selectedStudentId !== null) {
        scale = isSelected ? 1.4 : visible ? 0.16 : 0.001;
      }
      if (isHovered) scale *= 1.8;

      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color computation based on probabilities
      const pe = Math.max(0, 1 - p.pg - p.pd);
      const baseColor = getProbabilityColor(p.pg, p.pd, pe);

      if (selectedStudentId !== null && !isSelected) {
        baseColor.multiplyScalar(0.25); // Subtle dimming of background universe
      }
      if (isHovered) {
        baseColor.addScalar(0.4);
      }

      meshRef.current.setColorAt(i, baseColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [points, selectedStudentId, hoveredStudentId, filterOutcome, filterCluster, count]);

  return (
    <group visible={!showTerrain}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && e.instanceId < points.length) {
            onSelectStudent(points[e.instanceId].id);
          }
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && e.instanceId < points.length) {
            onHoverStudent(points[e.instanceId].id);
          }
        }}
        onPointerOut={() => onHoverStudent(null)}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
