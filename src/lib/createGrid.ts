import * as THREE from 'three'

export function createGrid(scene: THREE.Scene, size: number, step: number): THREE.GridHelper {
    const grid = new THREE.GridHelper(size, size / step * 2)
    grid.rotation.x = Math.PI / 2

    scene.add(grid)

    return grid
}