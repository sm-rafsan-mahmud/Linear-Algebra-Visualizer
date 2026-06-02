import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import type { Point3D, VectorObject } from './types'

const HEAD_RADIUS  = 0.15
const HEAD_LENGTH  = 0.25          // world units, not a proportion of vector length
const SEGMENTS     = 16


export function createVector(
    scene: THREE.Scene,
    pos: Point3D,
    color: number,
    gridSize: number
): VectorObject {
 
    // determine if the vector will extend past the grid
    // if so, we find the point on the grid edge it intersects
    // then we chop it.
    let chop: boolean = false

    if (Math.abs(pos.x) > gridSize) { chop = true }
    if (Math.abs(pos.y) > gridSize) { chop = true }
    if (Math.abs(pos.z) > gridSize) { chop = true }

    let intersection: Point3D

    if (chop) {
        let t = Infinity
        if (pos.x !== 0) t = Math.min(t, gridSize / Math.abs(pos.x))
        if (pos.y !== 0) t = Math.min(t, gridSize / Math.abs(pos.y))
        if (pos.z !== 0) t = Math.min(t, gridSize / Math.abs(pos.z))

        intersection = { x: t * pos.x, y: t * pos.y, z: t * pos.z }
    }

    // create the shaft
    const shaftGeometry = new LineGeometry()
    let shaftMaterial: LineMaterial
    if (chop) {
        shaftGeometry.setPositions([
            0, 0, 0,
            intersection!.x, intersection!.y, intersection!.z
            // we know intersection is not null because it was assigned
            // in an if statement with the same condition.
        ])

        shaftMaterial = new LineMaterial({
            color,
            linewidth: 3,
            dashed: true,
            dashSize: 0.15,
            gapSize:  0.1,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })
    } else {
        shaftGeometry.setPositions([
            0, 0, 0,
            pos.x, pos.y, pos.z
        ])

        shaftMaterial = new LineMaterial({
            color,
            linewidth: 3,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })
    }
    const shaft         = new Line2(shaftGeometry, shaftMaterial)
    shaft.computeLineDistances()
 
    // create the head
    const headGeometry = new THREE.ConeGeometry(HEAD_RADIUS, HEAD_LENGTH, SEGMENTS)
    const headMaterial = new THREE.MeshBasicMaterial({ color })
    const head         = new THREE.Mesh(headGeometry, headMaterial)
 
    // cone is also centered at origin: place it above the shaft
    const dir = new THREE.Vector3(pos.x, pos.y, pos.z).normalize()

    if (chop) {
        head.position.set(
            intersection!.x + dir.x * HEAD_LENGTH / 2,
            intersection!.y + dir.y * HEAD_LENGTH / 2,
            intersection!.z + dir.z * HEAD_LENGTH / 2
        )
    } else {
        head.position.set(
            pos.x + dir.x * HEAD_LENGTH / 2,
            pos.y + dir.y * HEAD_LENGTH / 2,
            pos.z + dir.z * HEAD_LENGTH / 2
        )
    }
 
    const yAxis = new THREE.Vector3(0, 1, 0)
    head.quaternion.setFromUnitVectors(yAxis, dir)
 
    scene.add(shaft, head)
 
    // create the projection (only if the vector stays in the grid.)
    let projection: Line2
    let dot: THREE.Mesh
    if (!chop) {
        // create the projection line
        const projGeometry = new LineGeometry()
        projGeometry.setPositions([
            pos.x, pos.y, pos.z,    // tip
            pos.x, pos.y, 0         // foot on XY plane
        ])
 
        const projMaterial = new LineMaterial({
            color,
            linewidth: 3,
            dashed: true,
            dashSize: 0.15,
            gapSize:  0.1,
            opacity:  0.5,
            transparent: true,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })
 
        projection = new Line2(projGeometry, projMaterial)
        projection.computeLineDistances()
        scene.add(projection)
 
        // create the projection dot
        dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, SEGMENTS, SEGMENTS),
            new THREE.MeshBasicMaterial({ color })
        )
        dot.position.set(pos.x, pos.y, 0)
        scene.add(dot)
    }
 
    return {shaft, head, pos}
}