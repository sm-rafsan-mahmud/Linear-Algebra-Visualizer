// This file contains all relevant math for vector transformations.
import * as mathjs from 'mathjs'
import type { Point3D, VectorObject } from './types'

export function scalarMultiply(s: number, v: VectorObject): Point3D {
    const vMat = mathjs.matrix([v.pos.x, v.pos.y, v.pos.z])

    const result = mathjs.multiply(s, vMat)

    return { x: result.get([0]), y: result.get([1]), z: result.get([2]) }
}

export function vectorAdd(u: VectorObject, v: VectorObject): Point3D {
    const uMat = mathjs.matrix([u.pos.x, u.pos.y, u.pos.z])
    const vMat = mathjs.matrix([v.pos.x, v.pos.y, v.pos.z])

    const result = mathjs.add(uMat, vMat)

    return { x: result.get([0]), y: result.get([1]), z: result.get([2]) }
}