import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import type { Font } from 'three/addons/loaders/FontLoader.js'
import type { Point3D, VectorObject } from '../types'
import { getScaledPos, isChopped, makeLabel } from '../utilFunctions'

const HEAD_RADIUS  = 0.21
const HEAD_LENGTH  = 0.35          // world units, not a proportion of vector length
const SEGMENTS     = 16

export function createVector(
    scene: THREE.Scene,
    pos: Point3D,
    color: number,
    realSize: number,
    gridSize: number,
    name: string,
    font: Font
): VectorObject {
    const scaledPos = getScaledPos(pos, realSize, gridSize)
    const length = Math.sqrt(scaledPos.x * scaledPos.x + scaledPos.y * scaledPos.y + scaledPos.z + scaledPos.z)
 
    // determine if the vector will extend past the grid
    // if so, we find the point on the grid edge it intersects
    // then we chop it.
    const chop: boolean = isChopped(pos, gridSize)

    // create the shaft
    const shaftGeometry = new LineGeometry()
    let shaftMaterial: LineMaterial
    let scaledIntersect: Point3D | null = null

    // create the head
    const headGeometry = new THREE.ConeGeometry(HEAD_RADIUS, HEAD_LENGTH, SEGMENTS)
    const headMaterial = new THREE.MeshBasicMaterial({ color })

    let head: THREE.Mesh | null = null
    
    if (length > HEAD_LENGTH)
        head = new THREE.Mesh(headGeometry, headMaterial)

    // need to orient the cone along the vector (used later, needed in both if & else)
    const dir = new THREE.Vector3(scaledPos.x, scaledPos.y, scaledPos.z).normalize()

    if (chop) {
        // find the coordinate of the vector at the edge of the grid.
        let t = Infinity
        if (pos.x !== 0) t = Math.min(t, gridSize / Math.abs(pos.x))
        if (pos.y !== 0) t = Math.min(t, gridSize / Math.abs(pos.y))
        if (pos.z !== 0) t = Math.min(t, gridSize / Math.abs(pos.z))

        const intersection = { x: t * pos.x, y: t * pos.y, z: t * pos.z }
        scaledIntersect = getScaledPos(intersection, realSize, gridSize)

        shaftGeometry.setPositions([
            0, 0, 0,
            scaledIntersect.x, scaledIntersect.y, scaledIntersect.z
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

        if (head)
            head.position.set(
                scaledIntersect.x + dir.x * HEAD_LENGTH / 2,
                scaledIntersect.y + dir.y * HEAD_LENGTH / 2,
                scaledIntersect.z + dir.z * HEAD_LENGTH / 2
            )

    } else {
        shaftGeometry.setPositions([
            0, 0, 0,
            scaledPos.x, scaledPos.y, scaledPos.z
        ])

        shaftMaterial = new LineMaterial({
            color,
            linewidth: 3,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })

        if (head)
            head.position.set(
                scaledPos.x + dir.x * HEAD_LENGTH / 2,
                scaledPos.y + dir.y * HEAD_LENGTH / 2,
                scaledPos.z + dir.z * HEAD_LENGTH / 2
            )
    }

    let shaft: Line2 | null = null

    if(length > HEAD_LENGTH) {
        shaft = new Line2(shaftGeometry, shaftMaterial)
        shaft.computeLineDistances()
    }

    const yAxis = new THREE.Vector3(0, 1, 0)

    if (head)
        head.quaternion.setFromUnitVectors(yAxis, dir)

    // create vector label
    let lblPos: Point3D | null
    const offset: Point3D = {
        x: pos.x < 0 ? -0.25 : 0.25,
        y: pos.y < 0 ? -0.25 : 0.25,
        z: pos.z < 0 ? -0.25 : 0.25
    }
    if (scaledIntersect) {
        lblPos = {
            x: scaledIntersect.x + offset.x,
            y: scaledIntersect.y + offset.y,
            z: scaledIntersect.z + offset.z
        }
    } else {
        lblPos = {
            x: scaledPos.x + offset.x,
            y: scaledPos.y + offset.y,
            z: scaledPos.z + offset.z
        }
    }

    let label: THREE.Mesh | null = null

    if (head)
        label = makeLabel(name, color, lblPos, font, 0.4)
 
    if (shaft) scene.add(shaft)

    if (head) scene.add(head)
        
    if (label) scene.add(label)

    return { shaft, head, pos, color, name, label }
}

export function disposeVector(scene: THREE.Scene, vector: VectorObject) {
    if (vector.shaft) {
        scene.remove(vector.shaft)
        vector.shaft.geometry.dispose();
        (vector.shaft.material as THREE.Material).dispose()
    }

    if (vector.head) {
        scene.remove(vector.head)
        vector.head.geometry.dispose();
        (vector.head.material as THREE.Material).dispose()
    }

    if (vector.label) {
        scene.remove(vector.label)
        vector.label.geometry.dispose();
        (vector.label.material as THREE.Material).dispose()
    }
}