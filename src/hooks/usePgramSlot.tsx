import * as THREE from 'three'
import { useRef } from 'react'
import type { PgramObject, Point3D, VectorObject } from "../lib/types"
import { createPgramVis, disposePgramVis } from '../lib/createPgramVis'
import { getRandomColor } from '../lib/color'

export function usePgramSlot({ sceneRef, REAL_GRID_SIZE, gridSizeRef } : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    REAL_GRID_SIZE: number,
    gridSizeRef: React.RefObject<number>,
}) {
    const ref = useRef<(PgramObject | null)[]>([])

    const set = (idx: number, u: Point3D, v: Point3D, sum: Point3D) => {
        const existing = ref.current[idx]
        if (existing) disposePgramVis(sceneRef.current!, existing)

        // createPgramVis expects VectorObjects but only reads .pos off them,
        // so these are minimal stand-ins, not real scene vectors
        const uObj = { pos: u } as VectorObject
        const vObj = { pos: v } as VectorObject

        const color = getRandomColor()
        const newPgram = createPgramVis(sceneRef.current!, uObj, vObj, sum, color, REAL_GRID_SIZE, gridSizeRef.current)

        while (ref.current.length <= idx) ref.current.push(null)
        ref.current[idx] = newPgram
    }

    const clear = (idx: number) => {
        const existing = ref.current[idx]
        if (existing) { disposePgramVis(sceneRef.current!, existing); ref.current[idx] = null }
    }

    const redraw = () => {
        ref.current = ref.current.map(pgram => {
            if (!pgram) return null
            const { pos, color, u, v } = pgram
            disposePgramVis(sceneRef.current!, pgram)
            return createPgramVis(sceneRef.current!, u, v, pos, color, REAL_GRID_SIZE, gridSizeRef.current)
        })
    }

    const disposeAll = () => ref.current.forEach(pgram => pgram && disposePgramVis(sceneRef.current!, pgram))

    return { set, clear, redraw, disposeAll }
}