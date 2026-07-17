import * as THREE from "three";

function rotationMatrixToQuaternion(R: number[][]): THREE.Quaternion {
  const m = new THREE.Matrix4().set(
    R[0][0], R[0][1], R[0][2], 0,
    R[1][0], R[1][1], R[1][2], 0,
    R[2][0], R[2][1], R[2][2], 0,
    0, 0, 0, 1
  );
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

function quaternionToMatrix(q: THREE.Quaternion): number[][] {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const e = m.elements; // column-major
  return [
    [e[0], e[4], e[8]],
    [e[1], e[5], e[9]],
    [e[2], e[6], e[10]],
  ];
}

export function determinant3x3(A: number[][]): number {
  const [[a, b, c], [d, e, f], [g, h, i]] = A;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

export function lerpMatrix(A: number[][], B: number[][], t: number): number[][] {
  return A.map((row, i) => row.map((v, j) => v + (B[i][j] - v) * t));
}

export function lerpVector(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t);
}

function multiplyMatrixVector(M: number[][], v: number[]): number[] {
  return M.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

export function interpolatedTransform(
  Rfrom: number[][], Sfrom: number[][],
  Rto: number[][], Sto: number[][],
  t: number
): number[][] {
  const qFrom = rotationMatrixToQuaternion(Rfrom);
  const qTo = rotationMatrixToQuaternion(Rto);
  const qt = new THREE.Quaternion().slerpQuaternions(qFrom, qTo, t);

  const Rt = quaternionToMatrix(qt);
  const St = lerpMatrix(Sfrom, Sto, t);

  // M(t) = R(t) * S(t)
  const rows = 3;
  const M: number[][] = Array.from({ length: rows }, () => [0, 0, 0]);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        M[i][j] += Rt[i][k] * St[k][j];

  return M;
}

export { multiplyMatrixVector };