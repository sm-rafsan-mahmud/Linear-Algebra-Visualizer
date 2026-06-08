import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'

export type Page = 'home' | 'transformations'
export type Point3D = { x: number, y: number, z: number }

export type AxesObject = {
    xAxis: Line2,
    yAxis: Line2,
    zAxis: Line2
}
export type AxisLabelsObject = {
    xLbl: THREE.Mesh,
    yLbl: THREE.Mesh,
    zLbl: THREE.Mesh
}

export type VectorObject = {
    shaft: Line2
    head:  THREE.Mesh
    pos:   Point3D,
    color: number
}
export type ProjectionObject = {
    line: Line2,
    dot: THREE.Mesh,
    pos: Point3D,
    color: number
}

export type RowData = {
    id: number;     // Unique identifier for loops and state updates
    value: string;  // The actual formula or number inside the row's cell
}