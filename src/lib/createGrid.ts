import * as THREE from 'three'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'

export function createGrid(
    scene: THREE.Scene,
    realSize: number,
    currSize: number,
    step: number,
    color: number,
    linewidth: number = 2
): LineSegments2 {
    const points: number[] = []

    // boundaries: irrelevant to grid size
    points.push(-realSize, -realSize, 0, -realSize,  realSize, 0)
    points.push(-realSize, -realSize, 0,  realSize, -realSize, 0)
    points.push(-realSize,  realSize, 0,  realSize,  realSize, 0)
    points.push( realSize, -realSize, 0,  realSize,  realSize, 0)

    // ratio of realSize to currSize is needed for proper scaling.
    const ratio = realSize / currSize

    // need to find largest mult. of step that is <= realSize.
    const maxStep = (currSize - (currSize % step)) * ratio

    const epsilon = 1e-9        // needed to help fight floating point errors causing the function to create one fewer line than necessary

    for (let i = -maxStep; i <= maxStep + epsilon; i += step * ratio) {
        if (Math.abs(i) > epsilon) {
            points.push(-realSize, i, 0, realSize, i, 0)
        }
    }

    for (let i = -maxStep; i <= maxStep + epsilon; i += step * ratio) {
        if (Math.abs(i) > epsilon) {
            points.push(i, -realSize, 0, i, realSize, 0)
        }
    }

    const geometry = new LineSegmentsGeometry()
    geometry.setPositions(points)               // same flat format as before, just a different class
 
    const material = new LineMaterial({
        color,
        linewidth,
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
