import * as THREE from 'three'
import type { Point3D } from './types'
// create a vector and display it to the scene.
// 
// parameters: scene, tip pos (either THREE.Vector3 or Point3D, unsure which is more useful.), color
// opt: keep track of num vectors and/or used colors incase color is not provided.

export function createVector(
    scene: THREE.Scene,
    pos: Point3D,
    color: number
): {arrow: THREE.ArrowHelper, projection: THREE.Line, dot: THREE.Mesh } {
    const tip = new THREE.Vector3(pos.x, pos.y, pos.z)

    // arrow
    const direction = new THREE.Vector3(pos.x, pos.y, pos.z).normalize()
    // TODO: Determine if I need to have that factor be a variable determined by the vector length.
    const length = new THREE.Vector3(pos.x, pos.y, pos.z).length() * 1.01
    const origin = new THREE.Vector3(0, 0, 0)

    const arrow = new THREE.ArrowHelper(direction, origin, length, color)
    scene.add(arrow)

    // projection line to xy plane
    const projectionGeometry = new THREE.BufferGeometry().setFromPoints([
        tip,
        new THREE.Vector3(pos.x, pos.y, 0)
    ])

    const projectionMaterial = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 0.1,
        gapSize: 0.1,
        opacity: 0.5,
        transparent: true
    })

    const projection = new THREE.Line(projectionGeometry, projectionMaterial)
    projection.computeLineDistances()

    scene.add(projection)

    // projection dot
    const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshBasicMaterial({ color })
    )
    dot.position.copy(tip)
    dot.position.z = 0

    scene.add(dot)

    return { arrow, projection, dot }

}