import * as THREE from 'three'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'


export function createGrid(
    scene: THREE.Scene,
    size: number,
    step: number,
    color: number,
    linewidth: number = 2): LineSegments2 {
    const points: number[] = []

    for (let i = -size; i <= size; i += step) {
        if (i !== 0) {
            points.push(-size, i , 0,  size, i, 0)
        }
    }

    for (let i = -size; i <= size; i+= step) {
        if (i !== 0) {
            points.push(i, -size, 0, i, size, 0)
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