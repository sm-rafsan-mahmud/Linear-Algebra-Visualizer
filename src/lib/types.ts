import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'

export type MatrixData = {
    nameID: string;
    values: string[][];
}

export type Page = 'home' | 'transformation'
export type Point3D = { x: number, y: number, z: number }
export type VectorObject = {
    shaft: Line2
    head:  THREE.Mesh
    pos:   Point3D,
    color: number
}

export type PgramObject = {
    uv: Line2 | null,
    vu: Line2 | null,
    pgram: THREE.Mesh,
    color: number,
    pos: Point3D,
    u: VectorObject,
    v: VectorObject
}
export type RowData = {
    keyId: number;     // Unique identifier for loops and state updates
    value: string;  // The actual formula or number inside the row's cell
}