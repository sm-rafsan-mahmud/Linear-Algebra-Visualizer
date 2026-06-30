import * as mathjs from 'mathjs'
import type { Point2D } from '../types'

export function applyTranslation(points: Point2D[], tx: number, ty: number) {
    const matrix = mathjs.matrix([
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1 ]
    ])

    return points.map(({x, y}) => {
        const result = mathjs.multiply(matrix, [x, y, 1])
        return {
            x: (result as mathjs.Matrix).get([0]),
            y: (result as mathjs.Matrix).get([1])
        }
    })
}

export function applyDilation(points: Point2D[], k: number) {
    const matrix = mathjs.matrix([
        [k, 0],
        [0, k]
    ])

    return points.map(({x, y}) => {
        const result = mathjs.multiply(matrix, [x, y])
        return {
            x: (result as mathjs.Matrix).get([0]),
            y: (result as mathjs.Matrix).get([1])
        }
    })
}

export function applyRotation(points: Point2D[], t: number) {
    const matrix = mathjs.matrix([
        [Math.cos(t), -Math.sin(t)],
        [Math.sin(t), Math.cos(t)]
    ])

    return points.map(({x, y}) => {
        const result = mathjs.multiply(matrix, [x, y])
        return {
            x: (result as mathjs.Matrix).get([0]),
            y: (result as mathjs.Matrix).get([1])
        } 
    })
}

export function applyReflection(points: Point2D[], rfX: boolean, rfY: boolean) {
    let x, y
    
    if (rfX) {
        x = -1

    } else x = 1

    if (rfY) {
        y = -1

    } else y = 1

    const matrix = mathjs.matrix([
        [x, 0],
        [0, y]
    ])

    return points.map(({x, y}) => {
        const result = mathjs.multiply(matrix, [x, y])
        return {
            x: (result as mathjs.Matrix).get([0]),
            y: (result as mathjs.Matrix).get([1])
        } 
    })
}