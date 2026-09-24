import * as THREE from 'three';

export const OUTCOME_GRAVITIES = {
  graduate: new THREE.Vector3(18, 12, 10),
  dropout: new THREE.Vector3(-20, -14, -12),
  enrolled: new THREE.Vector3(2, -6, 18)
};

export const COLOR_GRADUATE = new THREE.Color('#10b981'); // Emerald
export const COLOR_ENROLLED = new THREE.Color('#f59e0b');  // Amber
export const COLOR_DROPOUT = new THREE.Color('#ef4444');   // Crimson
export const COLOR_CYAN = new THREE.Color('#06b6d4');      // Electric Cyan
export const COLOR_VIOLET = new THREE.Color('#8b5cf6');    // Violet

export function getProbabilityColor(pg: number, pd: number, pe: number): THREE.Color {
  const r = COLOR_GRADUATE.r * pg + COLOR_DROPOUT.r * pd + COLOR_ENROLLED.r * pe;
  const g = COLOR_GRADUATE.g * pg + COLOR_DROPOUT.g * pd + COLOR_ENROLLED.g * pe;
  const b = COLOR_GRADUATE.b * pg + COLOR_DROPOUT.b * pd + COLOR_ENROLLED.b * pe;
  return new THREE.Color(r, g, b);
}

export function createTrajectoryCurve(
  entry: [number, number, number],
  sem1: [number, number, number],
  sem2: [number, number, number]
): THREE.CatmullRomCurve3 {
  const p0 = new THREE.Vector3(...entry);
  const p1 = new THREE.Vector3(...sem1);
  const p2 = new THREE.Vector3(...sem2);

  const mid01 = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
  mid01.y += 0.8;
  const mid12 = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  mid12.y -= 0.6;

  return new THREE.CatmullRomCurve3([p0, mid01, p1, mid12, p2]);
}

export function createBranchCurve(
  origin: [number, number, number],
  target: [number, number, number]
): THREE.CatmullRomCurve3 {
  const p0 = new THREE.Vector3(...origin);
  const p2 = new THREE.Vector3(...target);
  const p1 = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
  p1.y += (p2.y - p0.y) * 0.3 + 1.5;

  return new THREE.CatmullRomCurve3([p0, p1, p2]);
}
