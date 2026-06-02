import { useRef } from 'react'
import * as THREE from 'three'
import type { VectorObject } from '../lib/types'
import { createVector } from '../lib/createVector'
import { scalarMultiply, vectorAdd } from '../lib/vectorMath'

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

export function useVectors({sceneRef, gridSize} : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    gridSize: number
}) {
    const vectorsRef = useRef<VectorObject[]>([])

    const newVector = (x: number, y: number, z: number) => {
        vectorsRef.current.push(createVector(sceneRef.current!, {x, y, z}, getRandomColor(), gridSize))
    }

    const applyScalarMultiply = (s: number) => {
        const v = vectorsRef.current[vectorsRef.current.length - 1]
	    vectorsRef.current.push(createVector(sceneRef.current!, scalarMultiply(s, v), getRandomColor(), gridSize))
    }

    const applyVectorAdd = () => {
        const u: VectorObject = vectorsRef.current[vectorsRef.current.length - 2]
        const v: VectorObject = vectorsRef.current[vectorsRef.current.length - 1]
        vectorsRef.current.push(createVector(sceneRef.current!, vectorAdd(u, v), getRandomColor(), gridSize))
    }

    return {
        newVector,
        applyScalarMultiply,
        applyVectorAdd
    }
}