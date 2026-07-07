import * as mathjs from 'mathjs'
import type { Point2D } from '../types'

// ---------------------------------------------------------------------------
// BUILDERS
// Pure functions that build a transform matrix from typed inputs.
// They do NOT touch any points -- used by TransformControls to pre-fill a
// matrix that the user can then edit before it's ever applied to the shape.
// ---------------------------------------------------------------------------

export function buildTranslationMatrix(tx: number, ty: number): number[][] {
    return [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1]
    ]
}

export function buildDilationMatrix(k: number): number[][] {
    return [
        [k, 0],
        [0, k]
    ]
}

export function buildRotationMatrix(t: number): number[][] {
    return [
        [Math.cos(t), -Math.sin(t)],
        [Math.sin(t), Math.cos(t)]
    ]
}

export function buildReflectionMatrix(rfX: boolean, rfY: boolean): number[][] {
    let x, y

    if (rfX) {
        x = -1
    } else x = 1

    if (rfY) {
        y = -1
    } else y = 1

    // x and y seem backwards here because taking -1 * x is really
    // a reflection over the y axis: y values stay constant and
    // x values switch parity.
    return [
        [y, 0],
        [0, x]
    ]
}

// ---------------------------------------------------------------------------
// APPLIER
// A single generic function that applies ONE matrix to a set of points.
// Supports the two matrix shapes the UI allows: a 2x2 linear matrix, or a
// 3x3 homogeneous (affine) matrix. Anything else is left unimplemented for
// now since matrices are constrained to these two shapes.
// ---------------------------------------------------------------------------

export function applyMatrixToPoints(points: Point2D[], matrix: number[][]): Point2D[] {
    const rows = matrix.length
    const cols = matrix[0]?.length ?? 0

    if (rows === 3 && cols === 3) {
        return points.map(({ x, y }) => {
            const result = mathjs.multiply(matrix, [x, y, 1]) as number[]
            return { x: result[0], y: result[1] }
        })
    }

    if (rows === 2 && cols === 2) {
        return points.map(({ x, y }) => {
            const result = mathjs.multiply(matrix, [x, y]) as number[]
            return { x: result[0], y: result[1] }
        })
    }

    throw new Error(`Unsupported matrix shape for applying to points: ${rows}x${cols}`)
}

// ---------------------------------------------------------------------------
// CHAIN
// Applies an ordered list of matrices to the original points in sequence,
// returning the final result. This is what re-derives the shape's current
// position from scratch whenever the matrix stack changes.
// ---------------------------------------------------------------------------

export function applyMatrixChain(originalPoints: Point2D[], matrices: number[][][]): Point2D[] {
    return matrices.reduce((points, matrix) => applyMatrixToPoints(points, matrix), originalPoints)
}

// ---------------------------------------------------------------------------
// PARSING
// Matrix cells are stored as strings (so they're freely editable, and can
// hold simple expressions like "2*3" or "-1/2"). This turns a MatrixData's
// string[][] into a number[][], throwing if any cell doesn't evaluate to a
// finite number.
// ---------------------------------------------------------------------------

export function parseMatrixValues(values: string[][]): number[][] {
    return values.map(row =>
        row.map(cell => {
            const evaluated = mathjs.evaluate(cell)
            const num = typeof evaluated === 'number' ? evaluated : Number(evaluated)
            if (!Number.isFinite(num)) {
                throw new Error(`Invalid matrix cell value: "${cell}"`)
            }
            return num
        })
    )
}