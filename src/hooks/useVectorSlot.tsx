import * as THREE from 'three'
import { useRef } from 'react'
import type { VectorObject } from '../lib/types'
import { createVector, disposeVector } from '../lib/createVector'
import type { Font } from 'three/addons/loaders/FontLoader.js'
import { getRandomColor } from '../lib/color'

export function useVectorSlot({ sceneRef, REAL_GRID_SIZE, gridSizeRef, cachedFontRef } : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    REAL_GRID_SIZE: number,
    gridSizeRef: React.RefObject<number>,
    cachedFontRef: React.RefObject<Font | null>
}) {
    const ref = useRef<(VectorObject | null)[]>([])

    const set = (idx: number, x: number, y: number, z: number, name: string) => {
        const existing = ref.current[idx]
        if (existing) disposeVector(sceneRef.current!, existing)
        const color = getRandomColor()
        const newVec = createVector(sceneRef.current!, { x, y, z }, color, REAL_GRID_SIZE, gridSizeRef.current, name, cachedFontRef.current!)
        while (ref.current.length <= idx) ref.current.push(null)
        ref.current[idx] = newVec
    }

    const clear = (idx: number) => {
        const existing = ref.current[idx]
        if (existing) { disposeVector(sceneRef.current!, existing); ref.current[idx] = null }
    }

    const redraw = () => {
        ref.current = ref.current.map(vec => {
            if (!vec) return null
            const { pos, color, name } = vec
            disposeVector(sceneRef.current!, vec)
            return createVector(sceneRef.current!, pos, color, REAL_GRID_SIZE, gridSizeRef.current, name, cachedFontRef.current!)
        })
    }

    const disposeAll = () => ref.current.forEach(vec => vec && disposeVector(sceneRef.current!, vec))
    const setLabelAngles = (camera: THREE.Camera) => ref.current.forEach(vec => vec && vec.label.quaternion.copy(camera.quaternion))

    return { set, clear, redraw, disposeAll, setLabelAngles }
}