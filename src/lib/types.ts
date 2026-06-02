import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'

export type Page = 'home' | 'transformations'
export type Point3D = { x: number, y: number, z: number }

export type VectorObject = {
    shaft: Line2
    head:  THREE.Mesh
    pos:   Point3D
}

export type RowData = {
    keyId: number;     // Unique identifier for loops and state updates
    value: string;  // The actual formula or number inside the row's cell
}