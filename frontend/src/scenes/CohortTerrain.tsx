import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TerrainData, TerrainMode } from '../types';

interface CohortTerrainProps {
  data: TerrainData | null;
  mode: TerrainMode;
}

export const CohortTerrain: React.FC<CohortTerrainProps> = ({ data, mode }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    if (!data) return { geometry: null, colors: null };

    const size = data.grid_size;
    const geo = new THREE.PlaneGeometry(90, 90, size - 1, size - 1);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colorArr = new Float32Array(pos.count * 3);

    let matrix: number[][];
    if (mode === 'density') matrix = data.density;
    else if (mode === 'uncertainty') matrix = data.uncertainty;
    else if (mode === 'dropout') matrix = data.dropout_conc;
    else matrix = data.graduate_conc;

    const cGraduate = new THREE.Color('#10b981');
    const cDropout = new THREE.Color('#ef4444');
    const cCyan = new THREE.Color('#06b6d4');
    const cAmber = new THREE.Color('#f59e0b');

    for (let i = 0; i < pos.count; i++) {
      const ix = Math.floor(i / size);
      const iz = i % size;

      const val = (matrix[ix] && matrix[ix][iz]) !== undefined ? matrix[ix][iz] : 0;
      // Height elevation
      const height = val * 16.0 - 4.0;
      pos.setY(i, height);

      // Vertex color based on mode
      const vertColor = new THREE.Color();
      if (mode === 'density') {
        vertColor.copy(cCyan).multiplyScalar(0.2 + val * 0.8);
      } else if (mode === 'uncertainty') {
        vertColor.copy(cAmber).multiplyScalar(0.2 + val * 0.8);
      } else if (mode === 'dropout') {
        vertColor.copy(cDropout).multiplyScalar(0.2 + val * 0.8);
      } else {
        vertColor.copy(cGraduate).multiplyScalar(0.2 + val * 0.8);
      }

      colorArr[i * 3] = vertColor.r;
      colorArr[i * 3 + 1] = vertColor.g;
      colorArr[i * 3 + 2] = vertColor.b;
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    return { geometry: geo, colors: colorArr };
  }, [data, mode]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = -6.0;
  });

  if (!geometry) return null;

  return (
    <group>
      {/* 3D Terrain Surface */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          wireframe={false}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Wireframe Contour Overlay */}
      <mesh position={[0, -5.9, 0]} geometry={geometry}>
        <meshBasicMaterial
          color="#334155"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
};
