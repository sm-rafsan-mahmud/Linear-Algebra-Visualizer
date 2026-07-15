import * as THREE from 'three'
import { useRef } from 'react'
import type { PgramObject, Point3D } from "../../lib/types"
import { createPgramVis, disposePgramVis } from '../../lib/3d-vectors/createPgramVis'

export function usePgramSlot({ REAL_GRID_SIZE, gridSizeRef } : {
    REAL_GRID_SIZE: number,
    gridSizeRef: React.RefObject<number>,
}) {
    const ref = useRef<(PgramObject | null)[]>([])

    const set = (scene: THREE.Scene, idx: number, u: Point3D, v: Point3D, sum: Point3D, color: number) => {
        const existing = ref.current[idx]
        if (existing) disposePgramVis(scene, existing)

        const newPgram = createPgramVis(scene, u, v, sum, color, REAL_GRID_SIZE, gridSizeRef.current)

        while (ref.current.length <= idx) ref.current.push(null)
        ref.current[idx] = newPgram
    }

    const clear = (scene: THREE.Scene, idx: number) => {
        const existing = ref.current[idx]
        if (existing) { disposePgramVis(scene, existing); ref.current[idx] = null }
    }

    const redraw = (scene: THREE.Scene) => {
        ref.current = ref.current.map(pgram => {
            if (!pgram) return null
            const { sum, color, u, v } = pgram
            disposePgramVis(scene, pgram)
            return createPgramVis(scene, u, v, sum, color, REAL_GRID_SIZE, gridSizeRef.current)
        })
    }

    const disposeAll = (scene: THREE.Scene) => ref.current.forEach(pgram => pgram && disposePgramVis(scene, pgram))

    return { set, clear, redraw, disposeAll }
}