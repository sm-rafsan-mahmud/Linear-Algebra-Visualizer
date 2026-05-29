import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'

export type Page = 'home' | 'transformations'
export type Point3D = { x: number, y: number, z: number }
export type VectorObject ={
    group:      THREE.Group
    shaft:      THREE.Mesh
    head:       THREE.Mesh
    projection: Line2
    dot:        THREE.Mesh
    pos:        Point3D
}