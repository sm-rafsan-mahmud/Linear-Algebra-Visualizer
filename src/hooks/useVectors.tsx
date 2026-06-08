import { useRef } from 'react'
import * as THREE from 'three'
import type { ProjectionObject, VectorObject } from '../lib/types'
import { createProjection, createVector, disposeProjection, disposeVector } from '../lib/createVector'
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

export function useVectors({sceneRef, realSize, gridSizeRef} : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    realSize: number,
    gridSizeRef: React.RefObject<number>
}) {
    const vectorsRef = useRef<VectorObject[]>([])
    const projectionsRef = useRef<(ProjectionObject | null)[]>([])

    const newVector = (x: number, y: number, z: number) => {
        const color = getRandomColor()
        vectorsRef.current.push(createVector(sceneRef.current!, {x, y, z}, color, realSize, gridSizeRef.current))
        projectionsRef.current.push(createProjection(sceneRef.current!, {x, y, z}, color, realSize, gridSizeRef.current))
    }

    const applyScalarMultiply = (s: number) => {
        const v = vectorsRef.current[vectorsRef.current.length - 1]
        const color = getRandomColor()
	    vectorsRef.current.push(createVector(sceneRef.current!, scalarMultiply(s, v), color, realSize, gridSizeRef.current))
        projectionsRef.current.push(createProjection(sceneRef.current!, scalarMultiply(s, v), color, realSize, gridSizeRef.current))
    }

    const applyVectorAdd = () => {
        const u: VectorObject = vectorsRef.current[vectorsRef.current.length - 2]
        const v: VectorObject = vectorsRef.current[vectorsRef.current.length - 1]
        const color = getRandomColor()
        vectorsRef.current.push(createVector(sceneRef.current!, vectorAdd(u, v), color, realSize, gridSizeRef.current))
        projectionsRef.current.push(createProjection(sceneRef.current!, vectorAdd(u, v), color, realSize, gridSizeRef.current))
    }

    const redrawVectors = () => {
        vectorsRef.current = vectorsRef.current.map((vector) => {
            const { pos, color } = vector
            disposeVector(sceneRef.current!, vector)
            return createVector(sceneRef.current!, pos, color, realSize, gridSizeRef.current)
        })

        for (let i = 0; i < projectionsRef.current.length; i++) {
            if (projectionsRef.current[i]) {
                const { pos, color } = projectionsRef.current[i]!
                disposeProjection(sceneRef.current!, projectionsRef.current[i]!)
                projectionsRef.current[i] = createProjection(sceneRef.current!, pos, color, realSize, gridSizeRef.current)
            
            } else {
                const { pos, color } = vectorsRef.current[i]
                projectionsRef.current[i] = createProjection(sceneRef.current!, pos, color, realSize, gridSizeRef.current)
            }
        }
    }

    const disposeVectors = () => {
        for (let i = 0; i < vectorsRef.current.length; i++) {
            const v = vectorsRef.current[i]
            sceneRef.current!.remove(v.shaft, v.head);
            v.shaft.geometry.dispose();
            (v.shaft.material as THREE.Material).dispose()
            v.head.geometry.dispose();
            (v.head.material as THREE.Material).dispose()

            if (projectionsRef.current[i]) {
                const p = projectionsRef.current[i]!
                sceneRef.current!.remove(p.line, p.dot)
                p.line.geometry.dispose();
                (p.line.material as THREE.Material).dispose()
                p.dot.geometry.dispose();
                (p.dot.material as THREE.Material).dispose()
            }
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