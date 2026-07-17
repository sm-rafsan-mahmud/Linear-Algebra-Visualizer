import * as THREE from 'three'
import * as mathjs from "mathjs"
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { type Font, FontLoader } from 'three/addons/loaders/FontLoader.js'
import type { ActiveAnimation, Point3D } from "./types"
import { determinant3x3 } from './3d-vectors/interpolateTransform'

export function getRandomColor() {
    const h = Math.random() * 360         // any hue
    const s = 100                         // 100% saturations
    const l = 55 + Math.random() * 20     // 55–75% lightness

    // HSL → RGB conversion
    const a = s / 100
    const f = (n: number) => {
        const k = (n + h / 30) % 12
        const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color)
    };

    const r = f(0)
    const g = f(8)
    const b = f(4)

    // Pack into a single integer the way Three.js expects
    return (r << 16) | (g << 8) | b
}

export function getDefaultColor(): string {
    const DEFAULT_COLORS = [
        "#E74C3C", "#3498DB", "#2ECC71",
        "#F1C40F", "#9B59B6", "#E67E22"
    ]

    return DEFAULT_COLORS[Math.floor(Math.random() * 6)]
}

export function colorToNumber(hex: string): number {
    return parseInt(hex.replace('#', '0x'), 16);
}

export function isChopped(pos: Point3D, gridSize: number) {
    if (Math.abs(pos.x) > gridSize) { return true }
    if (Math.abs(pos.y) > gridSize) { return true }
    if (Math.abs(pos.z) > gridSize) { return true }

    return false
}

export function getScaledPos(pos: Point3D, realSize: number, gridSize: number): Point3D {
    const ratio = realSize / gridSize
    return { x: pos.x * ratio, y: pos.y * ratio, z: pos.z * ratio }
}

export function makeLabel(
    text: string,
    color: number,
    pos: Point3D,
    font: Font,
    size: number
) {
    const geometry = new TextGeometry(text, {
        font,
        size,
        depth: 0.05
    })
    
    geometry.center()
        
    const label = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color })
    )
    
    label.position.set(pos.x, pos.y, pos.z)

    return label
}

let cachedFont: Font | null = null

export async function getFont(): Promise<Font> {
    if (cachedFont) return cachedFont
    const loader = new FontLoader()
    cachedFont = await loader.loadAsync(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
    )
    return cachedFont
}

// Newton's iteration for the orthogonal factor of A = RS
export function polarDecompose(A: number[][]): { R: number[][]; S: number[][] } {
  let R = A;
  for (let i = 0; i < 12; i++) {
    const Rinv = mathjs.inv(R) as unknown as number[][];
    const RinvT = mathjs.transpose(Rinv);
    const next = mathjs.multiply(0.5, mathjs.add(R, RinvT)) as unknown as number[][];
    const diff = mathjs.norm(mathjs.subtract(next, R) as math.MathArray) as number;
    R = next;
    if (diff < 1e-10) break;
  }
  const S = mathjs.multiply(mathjs.transpose(R), A) as unknown as number[][];
  return { R, S };
}
export function identity3x3(): number[][] {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

export function matricesEqual(A: number[][], B: number[][], eps = 1e-9): boolean {
  if (A.length !== B.length) return false;
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[i].length; j++) {
      if (Math.abs(A[i][j] - B[i][j]) > eps) return false;
    }
  }
  return true;
}

export function vectorsEqual(a: number[], b: number[], eps = 1e-9): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => Math.abs(v - b[i]) <= eps);
}

export function startAnimation(
        idx: number,
        vFrom: number[],
        vTo: number[],
        Aprev: number[][],
        Anext: number[][],
        color: string,
        name: string,
        duration = 700,
        ref: React.RefObject<ActiveAnimation[]>
    ) {
        const isProper = determinant3x3(Aprev) >= -1e-9 && determinant3x3(Anext) >= -1e-9

        const { R: Rfrom, S: Sfrom } = polarDecompose(Aprev)
        const { R: Rto, S: Sto } = polarDecompose(Anext)

        ref.current = ref.current.filter(a => a.idx !== idx)
        ref.current.push({
            idx, vFrom, vTo, Aprev, Anext, Rfrom, Sfrom, Rto, Sto, isProper,
            startTime: performance.now(),
            duration,
            color,
            name
        })
    }