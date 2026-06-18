import { useRef } from 'react'
import * as THREE from 'three'
import type { Point3D, PgramObject, VectorObject } from '../lib/types'
import { createVector, disposeVector } from '../lib/createVector'
import { createPgramVis, disposePgramVis } from '../lib/createPgramVis'
import type { Font } from 'three/addons/loaders/FontLoader.js'

function getRandomColor() {
    const h = Math.random() * 360         // any hue
    const s = 100                         // 100% saturations
    const l = 55 + Math.random() * 20     // 55–75% lightness

    // HSL → RGB conversion
    const a = s / 100
    const f = (n: number) => {
        const k = (n + h / 30) % 12
        const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color)
    };

    const r = f(0)
    const g = f(8)
    const b = f(4)

    // Pack into a single integer the way Three.js expects
    return (r << 16) | (g << 8) | b
}

export function useVectors({ sceneRef, realSize, gridSizeRef, cachedFontRef } : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    realSize: number,
    gridSizeRef: React.RefObject<number>
    cachedFontRef: React.RefObject<Font | null>
}) {
    const matrixVectorsRef = useRef<(VectorObject | null)[]>([])
    const resultVectorsRef = useRef<(VectorObject | null)[]>([])
    const resultPgramsRef = useRef<(PgramObject | null)[]>([])


    const setMatrixVector = (matIdx: number, x: number, y: number, z: number, name: string) => {
        // Dispose any existing vector for this matrix slot
        const existing = matrixVectorsRef.current[matIdx]
        if (existing) {
            disposeVector(sceneRef.current!, existing)
        }

        const color = getRandomColor()
        const newVec = createVector(sceneRef.current!, { x, y, z }, color, realSize, gridSizeRef.current, name, cachedFontRef.current!)

        // Grow the array with nulls if needed, then assign
        while (matrixVectorsRef.current.length <= matIdx) {
            matrixVectorsRef.current.push(null)
        }
        matrixVectorsRef.current[matIdx] = newVec
    }

    const clearMatrixVector = (matIdx: number) => {
        const existing = matrixVectorsRef.current[matIdx]
        if (existing) {
            disposeVector(sceneRef.current!, existing)
            matrixVectorsRef.current[matIdx] = null
        }
    }

    const setResultVector = (rowIdx: number, x: number, y: number, z: number, name: string) => {
        const existing = resultVectorsRef.current[rowIdx]
        if (existing) disposeVector(sceneRef.current!, existing)

        const color = getRandomColor()
        const newVec = createVector(sceneRef.current!, { x, y, z }, color, realSize, gridSizeRef.current, name, cachedFontRef.current!)

        while (resultVectorsRef.current.length <= rowIdx) resultVectorsRef.current.push(null)
        resultVectorsRef.current[rowIdx] = newVec
    }

    const clearResultVector = (rowIdx: number) => {
        const existing = resultVectorsRef.current[rowIdx]
        if (existing) {
            disposeVector(sceneRef.current!, existing)
            resultVectorsRef.current[rowIdx] = null
        }
    }

    const setResultPgram = (
        rowIdx: number,
        u: Point3D,
        v: Point3D,
        sum: Point3D
    ) => {
        const existing = resultPgramsRef.current[rowIdx]
        if (existing) disposePgramVis(sceneRef.current!, existing)

        // createPgramVis expects VectorObjects, but only uses .pos from them
        // so we construct minimal stand-ins
        const uObj  = { pos: u }  as VectorObject
        const vObj  = { pos: v }  as VectorObject

        const color = getRandomColor()
        const pgram = createPgramVis(uObj, vObj, sum, color, realSize, gridSizeRef.current, sceneRef.current!)

        while (resultPgramsRef.current.length <= rowIdx) resultPgramsRef.current.push(null)
        resultPgramsRef.current[rowIdx] = pgram
    }

    const clearResultPgram = (rowIdx: number) => {
        const existing = resultPgramsRef.current[rowIdx]
        if (existing) {
            disposePgramVis(sceneRef.current!, existing)
            resultPgramsRef.current[rowIdx] = null
        }
    }

    const setLabelAngles = (is3D: boolean, camera: THREE.PerspectiveCamera, orthoCamera: THREE.OrthographicCamera) => {
        matrixVectorsRef.current.forEach(vec => {
            if (vec)
                vec.label.quaternion.copy(is3D ? camera.quaternion : orthoCamera.quaternion)
        })
        resultVectorsRef.current.forEach(vec => {
            if (vec)
                vec.label.quaternion.copy(is3D ? camera.quaternion : orthoCamera.quaternion)
        })
    }

    const redrawVectors = () => {
        matrixVectorsRef.current = matrixVectorsRef.current.map((vec) => {
            if (!vec) return null
            const { pos, color, name } = vec
            disposeVector(sceneRef.current!, vec)
            return createVector(sceneRef.current!, pos, color, realSize, gridSizeRef.current, name, cachedFontRef.current!)
        })

        resultVectorsRef.current = resultVectorsRef.current.map((vec) => {
            if (!vec) return null
            const { pos, color, name } = vec
            disposeVector(sceneRef.current!, vec)
            return createVector(sceneRef.current!, pos, color, realSize, gridSizeRef.current, name, cachedFontRef.current!)
        })

        resultPgramsRef.current = resultPgramsRef.current.map((pgram) => {
            if (!pgram) return null
            const { pos, color, u, v } = pgram
            disposePgramVis(sceneRef.current!, pgram)
            return createPgramVis(u, v, pos, color, realSize, gridSizeRef.current, sceneRef.current!)
        })
    }

    const disposeVectors = () => {
        for (let i = 0; i < matrixVectorsRef.current.length; i++) {
            const vec = matrixVectorsRef.current[i]
            if (vec) disposeVector(sceneRef.current!, vec)
        }

        for (let i = 0; i < resultVectorsRef.current.length; i++) {
            const vec = resultVectorsRef.current[i]
            if (vec) disposeVector(sceneRef.current!, vec)
        }

        for (let i = 0; i < resultPgramsRef.current.length; i++) {
            const pgram = resultPgramsRef.current[i]
            if (pgram) disposePgramVis(sceneRef.current!, pgram)
        }
    }

    return {
        redrawVectors,
        disposeVectors,
        setMatrixVector,
        clearMatrixVector,
        setResultVector,
        clearResultVector,
        setResultPgram,
        clearResultPgram,
        setLabelAngles
    }
}