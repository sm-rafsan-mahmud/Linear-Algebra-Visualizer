import * as THREE from 'three'
import * as mathjs from 'mathjs'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'

function clipSegment(
    pt1: number[],
    pt2: number[],
    half: number
): [number[], number[]] | null {
    const dx = pt2[0] - pt1[0]
    const dy = pt2[1] - pt1[1]

    let tMin = 0
    let tMax = 1

    // Check each slab (x and y). t=0 is pt1, t=1 is pt2.
    for (const [p, d, lo, hi] of [
        [pt1[0], dx, -half, half],
        [pt1[1], dy, -half, half],
    ] as [number, number, number, number][]) {
        if (Math.abs(d) < 1e-12) {
            // Segment is parallel to this slab — check if it's inside
            if (p < lo || p > hi) return null
        } else {
            const t1 = (lo - p) / d
            const t2 = (hi - p) / d
            tMin = Math.max(tMin, Math.min(t1, t2))
            tMax = Math.min(tMax, Math.max(t1, t2))
        }
    }

    if (tMin > tMax) return null  // segment misses the box entirely

    return [
        [pt1[0] + dx * tMin, pt1[1] + dy * tMin, 0],
        [pt1[0] + dx * tMax, pt1[1] + dy * tMax, 0],
    ]
}

export function createGrid(
    scene: THREE.Scene,
    realSize: number,
    currSize: number,
    step: number,
    color: number,
    transform: number[][] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]
): LineSegments2 {
    const points: number[] = []
    const ratio = realSize / currSize   //ensures proper scaling
    const maxStep = (currSize - (currSize % step)) * ratio  // largest grid step 'in' the grid

    const DEFAULT_MATRIX = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]

    // boundaries: irrelevant to grid size
    points.push(-realSize, -realSize, 0, -realSize,  realSize, 0)
    points.push(-realSize, -realSize, 0,  realSize, -realSize, 0)
    points.push(-realSize,  realSize, 0,  realSize,  realSize, 0)
    points.push( realSize, -realSize, 0,  realSize,  realSize, 0)

    // needed to help fight floating point errors
    // that cause the function to create one fewer line than necessary
    const epsilon = 1e-9

    for (let i = -maxStep; i <= maxStep + epsilon; i += step * ratio) {
        const pt1 = mathjs.multiply(transform, [-realSize, i, 0])
        const pt2 = mathjs.multiply(transform, [ realSize, i, 0])

        const clipped = clipSegment(pt1, pt2, realSize)
        if (!clipped) continue
        const [c1, c2] = clipped

        if (Math.abs(c1[1]) > epsilon) {
            points.push(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2])
        }
    }

    for (let i = -maxStep; i <= maxStep + epsilon; i += step * ratio) {
        const pt1 = mathjs.multiply(transform, [i, -realSize, 0])
        const pt2 = mathjs.multiply(transform, [i,  realSize, 0])

        const clipped = clipSegment(pt1, pt2, realSize)
        if (!clipped) continue
        const [c1, c2] = clipped

        if (Math.abs(c1[0]) > epsilon) {
            points.push(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2])
        }
    }

    const geometry = new LineSegmentsGeometry()
    geometry.setPositions(points)               // same flat format as before, just a different class
 
    const opacity = DEFAULT_MATRIX === transform ? 0.3 : 0.95

    const material = new LineMaterial({
        color,
        opacity,
        transparent: true,
        linewidth: 2,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    })
 
    const grid = new LineSegments2(geometry, material)
    scene.add(grid)

    return grid
}

/**
 * Removes a grid from the scene and frees its GPU resources.
 * Always call this instead of just scene.remove() to avoid memory leaks.
 */
export function disposeGrid(scene: THREE.Scene, grid: LineSegments2): void {
    scene.remove(grid)
    grid.geometry.dispose();
    (grid.material as THREE.Material).dispose()
}
