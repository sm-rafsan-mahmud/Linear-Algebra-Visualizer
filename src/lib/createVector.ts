import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import type { Point3D, VectorObject } from './types'

// create a vector and display it to the scene.
// 
// parameters: scene, tip pos (either THREE.Vector3 or Point3D, unsure which is more useful.), color
// opt: keep track of num vectors and/or used colors incase color is not provided.

const SHAFT_RADIUS = 0.03
const HEAD_RADIUS  = 0.08
const HEAD_LENGTH  = 0.25          // world units, not a proportion of vector length
const SEGMENTS     = 16


export function createVector(
    scene: THREE.Scene,
    pos: Point3D,
    color: number
): VectorObject {
    const tip    = new THREE.Vector3(pos.x, pos.y, pos.z)
    const length = tip.length()
 
    // create the shaft
    const shaftLength = Math.max(0, length - HEAD_LENGTH)
 
    const shaftGeometry = new THREE.CylinderGeometry(SHAFT_RADIUS, SHAFT_RADIUS, shaftLength, SEGMENTS)
    const shaftMaterial = new THREE.MeshBasicMaterial({ color })
    const shaft         = new THREE.Mesh(shaftGeometry, shaftMaterial)
 
    // ensure shaft starts at origin: centered at origin by default
    shaft.position.y = shaftLength / 2
 
    // create the head
    const headGeometry = new THREE.ConeGeometry(HEAD_RADIUS, HEAD_LENGTH, SEGMENTS)
    const headMaterial = new THREE.MeshBasicMaterial({ color })
    const head         = new THREE.Mesh(headGeometry, headMaterial)
 
    // cone is also centered at origin: place it above the shaft
    head.position.y = shaftLength + HEAD_LENGTH / 2
 
    // create the group to change direction at the same time.
    const group = new THREE.Group()
    group.add(shaft, head)
 
    const yAxis = new THREE.Vector3(0, 1, 0)
    group.quaternion.setFromUnitVectors(yAxis, tip.clone().normalize())
 
    scene.add(group)
 
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
 
    const projection = new Line2(projGeometry, projMaterial)
    projection.computeLineDistances()
    scene.add(projection)
 
    // create the projection dot
    const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, SEGMENTS, SEGMENTS),
        new THREE.MeshBasicMaterial({ color })
    )
    dot.position.set(pos.x, pos.y, 0)
    scene.add(dot)
 
    return { group, shaft, head, projection, dot, pos }
}