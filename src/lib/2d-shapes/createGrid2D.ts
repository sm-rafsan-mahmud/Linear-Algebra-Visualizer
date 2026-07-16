import * as THREE from 'three'

export function createGrid2D(scene: THREE.Scene, size: number, step: number, color: number): THREE.LineSegments {
    const points: number[] = []

    for (let i = -size; i <= size; i += step) {
        points.push(-size, i , 0,  size, i, 0)
    }

    for (let i = -size; i <= size; i+= step) {
        points.push(i, -size, 0, i, size, 0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))

    const material = new THREE.LineBasicMaterial({ color })
    const grid = new THREE.LineSegments(geometry, material)
    scene.add(grid)

    return grid
}