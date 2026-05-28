import * as THREE from 'three'

export function createGrid(scene: THREE.Scene, sizeX: number, sizeY: number, step: number, color: number): THREE.LineSegments {
    const points: number[] = []

    for (let i = -sizeY; i <= sizeY; i += step) {
        points.push(-sizeX, i , 0,  sizeX, i, 0)
    }

    for (let i = -sizeX; i <= sizeX; i+= step) {
        points.push(i, -sizeY, 0, i, sizeY, 0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))

    const material = new THREE.LineBasicMaterial({ color })
    const grid = new THREE.LineSegments(geometry, material)
    scene.add(grid)

    return grid
}