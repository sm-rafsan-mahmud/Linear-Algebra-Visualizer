import * as THREE from 'three'

export function createAxes(
    scene: THREE.Scene,
    size: number,
    xColor: number,
    yColor: number,
    zColor: number
): { xAxis: THREE.Line, yAxis: THREE.Line, zAxis: THREE.Line } {
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-size, 0, 0),
        new THREE.Vector3(size, 0, 0)
    ])

    const yGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -size, 0),
        new THREE.Vector3(0, size, 0)
    ])

    const zGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -size),
        new THREE.Vector3(0, 0, size)
    ])

    const xMaterial = new THREE.LineBasicMaterial({ color: xColor })
    const yMaterial = new THREE.LineBasicMaterial({ color: yColor })
    const zMaterial = new THREE.LineBasicMaterial({ color: zColor })

    const xAxis = new THREE.Line(xGeometry, xMaterial)
    const yAxis = new THREE.Line(yGeometry, yMaterial)
    const zAxis = new THREE.Line(zGeometry, zMaterial)
    
    scene.add(xAxis)
    scene.add(yAxis)
    scene.add(zAxis)

    return {xAxis, yAxis, zAxis}
}