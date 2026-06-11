import { useRef } from 'react'
import * as THREE from 'three'
import type { PgramObject, VectorObject } from '../lib/types'
import { createVector, disposeVector } from '../lib/createVector'
import { scalarMultiply, vectorAdd } from '../lib/vectorMath'
import { createPgramVis, disposePgramVis } from '../lib/createPgramVis'

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

export function useVectors({sceneRef, realSize, gridSizeRef} : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    realSize: number,
    gridSizeRef: React.RefObject<number>
}) {
    const vectorsRef = useRef<VectorObject[]>([])
    const pgramRef = useRef<PgramObject[]>([])

    const newVector = (x: number, y: number, z: number) => {
        const color = getRandomColor()
        vectorsRef.current.push(createVector(sceneRef.current!, {x, y, z}, color, realSize, gridSizeRef.current))
    }

    const applyScalarMultiply = (s: number) => {
        const v = vectorsRef.current[vectorsRef.current.length - 1]
        const color = getRandomColor()
	    vectorsRef.current.push(createVector(sceneRef.current!, scalarMultiply(s, v), color, realSize, gridSizeRef.current))
    }

    const applyVectorAdd = () => {
        const u: VectorObject = vectorsRef.current[vectorsRef.current.length - 2]
        const v: VectorObject = vectorsRef.current[vectorsRef.current.length - 1]
        const color = getRandomColor()
        const pos = vectorAdd(u, v)
        vectorsRef.current.push(createVector(sceneRef.current!, vectorAdd(u, v), color, realSize, gridSizeRef.current))
        pgramRef.current.push(createPgramVis(u, v, pos, color, realSize, gridSizeRef.current, sceneRef.current!))
    }

    const redrawVectors = () => {
        vectorsRef.current = vectorsRef.current.map((vector) => {
            const { pos, color } = vector
            disposeVector(sceneRef.current!, vector)
            return createVector(sceneRef.current!, pos, color, realSize, gridSizeRef.current)
        })

        if (pgramRef.current.length > 0) {
            pgramRef.current = pgramRef.current.map((pgram) => {
                const { color, pos, u, v } = pgram
                disposePgramVis(sceneRef.current!, pgram)
                return createPgramVis(u, v, pos, color, realSize, gridSizeRef.current, sceneRef.current!)
            })
        }
    }

    const disposeVectors = () => {
        for (let i = 0; i < vectorsRef.current.length; i++) {
            disposeVector(sceneRef.current!, vectorsRef.current[i])
        }

        for (let i = 0; i < pgramRef.current.length; i++) {
            disposePgramVis(sceneRef.current!, pgramRef.current[i])
        }
    }

    return {
        newVector,
        applyScalarMultiply,
        applyVectorAdd,
        redrawVectors,
        disposeVectors
    }
}