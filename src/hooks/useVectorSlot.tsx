import * as THREE from 'three'
import { useRef } from 'react'
import type { VectorObject } from '../lib/types'
import { createVector, disposeVector } from '../lib/createVector'
import type { Font } from 'three/addons/loaders/FontLoader.js'

export function useVectorSlot({ REAL_GRID_SIZE, gridSizeRef, cachedFontRef } : {
    REAL_GRID_SIZE: number,
    gridSizeRef: React.RefObject<number>,
    cachedFontRef: React.RefObject<Font | null>
}) {
    const ref = useRef<(VectorObject | null)[]>([])

    const set = (scene: THREE.Scene, idx: number, x: number, y: number, z: number, color: number, name: string) => {
        const existing = ref.current[idx]
        if (existing) disposeVector(scene, existing)
        const newVec = createVector(scene, { x, y, z }, color, REAL_GRID_SIZE, gridSizeRef.current, name, cachedFontRef.current!)
        while (ref.current.length <= idx) ref.current.push(null)
        ref.current[idx] = newVec
    }

    const clear = (scene: THREE.Scene, idx: number) => {
        const existing = ref.current[idx]
        if (existing) { disposeVector(scene, existing); ref.current[idx] = null }
    }

    const redraw = (scene: THREE.Scene) => {
        ref.current = ref.current.map(vec => {
            if (!vec) return null
            const { pos, color, name } = vec
            disposeVector(scene, vec)
            return createVector(scene, pos, color, REAL_GRID_SIZE, gridSizeRef.current, name, cachedFontRef.current!)
        })
    }

    const disposeAll = (scene: THREE.Scene) => ref.current.forEach(vec => vec && disposeVector(scene, vec))
    const setLabelAngles = (camera: THREE.Camera) => ref.current.forEach(vec => vec && vec.label.quaternion.copy(camera.quaternion))

    return { set, clear, redraw, disposeAll, setLabelAngles }
}