import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'

export type Page = 'transformations' | 'shapes'

// transformation page
export type Point3D = { x: number, y: number, z: number }

export interface FormulaData {
  id: number;     
  value: string; 
}

export interface MatrixData {
  name: string;
  values: string[][];
}

export interface VectorData {
  name: string;
  values: string[];
  color: string;
}

export interface VariableData {
  name: string;
  value: number;
}

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
    shaft: Line2 | null
    head:  THREE.Mesh | null
    pos:   Point3D,
    color: number,
    name: string,
    label: THREE.Mesh | null
}

export type PgramObject = {
    uv: Line2 | null,
    vu: Line2 | null,
    pgram: THREE.Mesh,
    color: number,
    sum: Point3D,
    u: Point3D,
    v: Point3D
}

export type RowData = {
    id: number;     // Unique identifier for loops and state updates
    value: string;  // The actual formula or number inside the row's cell
}

// shapes page
export type Point2D = {x: number, y: number}

export type ShapesPageState = 'idle' | 'placing' | 'transforming'

export type TransformationType
    = 'identity'
    | 'translation'
    | 'dilation'
    | 'rotation'
    | 'shear'
    | 'squeeze'
    | 'reflection'
    
export type ApplyTransformButton
    = 'Reset'
    | 'Prev'
    | 'Next'
    | 'All'

export type TransformationMatrixData = {
    id: string
    color: string
    name: string
    values: string[][]
}