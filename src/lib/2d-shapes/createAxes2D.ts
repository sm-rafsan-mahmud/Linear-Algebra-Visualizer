import * as THREE from 'three'

export function createAxes2D(scene: THREE.Scene, xSize: number, ySize: number, xColor: number, yColor: number) {
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-xSize, 0, 0),
        new THREE.Vector3(xSize, 0, 0)
    ])

    const yGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -ySize, 0),
        new THREE.Vector3(0, ySize, 0)
    ])

    const xMaterial = new THREE.LineBasicMaterial({ color: xColor })
    const yMaterial = new THREE.LineBasicMaterial({ color: yColor })

    const xAxis = new THREE.Line(xGeometry, xMaterial)
    const yAxis = new THREE.Line(yGeometry, yMaterial)
    
    scene.add(xAxis)
    scene.add(yAxis)

    return {xAxis, yAxis}
}