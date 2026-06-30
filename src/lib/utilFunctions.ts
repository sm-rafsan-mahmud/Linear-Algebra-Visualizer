import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import type { Font } from 'three/addons/loaders/FontLoader.js';
import type { Point3D } from "./types";

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