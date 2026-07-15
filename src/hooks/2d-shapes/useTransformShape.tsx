import { useCallback, useRef, useState } from 'react'
import * as THREE from 'three'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import type { MatrixData, Point2D } from '../../lib/types'

import {
    applyMatrixChain,
    parseMatrixValues
} from '../../lib/2d-shapes/applyTransform'
import { updateShapeMesh } from '../../lib/2d-shapes/updateShapeMesh'
import { createWireframe } from '../../lib/2d-shapes/createWireframe'

interface UseTransformShapeProps {
    sceneRef: React.RefObject<THREE.Scene | null>
    setDemoState: (state: string) => void
    stateRef: React.RefObject<string>
}

export function useTransformShape({ sceneRef, setDemoState, stateRef }: UseTransformShapeProps) {
    const shapeMeshRef = useRef<THREE.Mesh | null>(null)
    const originalPointsRef = useRef<Point2D[]>([])
    const currentPointsRef = useRef<Point2D[]>([])
    const wireframesRef = useRef<LineSegments2[]>([])

    const [matrices, setMatrices] = useState<MatrixData[]>([])
    const [applyError, setApplyError] = useState<string | null>(null)

    const addMatrix = (name: string, values: string[][]) => {
        setMatrices(prev => [...prev, {name, values}])
    }

    // Reorders the staged matrix list. handleApplyMatrices will replay
    // the chain in this new order next time it's called.
    const reorderMatrices = useCallback((oldIndex: number, newIndex: number) => {
        setMatrices(prev => {
            const next = [...prev]
            const [moved] = next.splice(oldIndex, 1)
            next.splice(newIndex, 0, moved)
            return next
        })
    }, [])

    // called by usePlaceShape via onShapeConfirmed
    const initShape = (mesh: THREE.Mesh, points: Point2D[]) => {
        shapeMeshRef.current = mesh
        originalPointsRef.current = [...points]
        currentPointsRef.current = [...points]
    }

    const handleMatrixEdit = (name: string, values: string[][]) => {
        setMatrices(prev => prev.map(m => (m.name === name ? { ...m, values } : m)))
    }

    const applyTransformsToIndex = (index: number) => {
        // reset to the original position
        disposeWireframes()
        updateShapeMesh(shapeMeshRef.current!, originalPointsRef.current)

        // if index > 0, iterate through to index. This does two things:
        // 1. makes it easier to implement all four mouseButtons
        // 2. if a matrix before currTransfrom is edited, pressing any button
        //    will reflect that change.
        let place = 0
        while (place < index) {
            applyNextTransform(place++)
        }
    }

    const applyNextTransform = (index: number) => {
        if (!matrices[index]) return

        try {
            // create wireframe at current position
            // we re-derive the new position from the original for two reasons
            // (a) this ensures that if an earlier matrix was edited we reflect that
            const prev = index
            const matsToPrev = matrices.slice(0, prev).map(m => parseMatrixValues(m.values))
            const newFramePts = applyMatrixChain(originalPointsRef.current, matsToPrev)
            wireframesRef.current.push(createWireframe(sceneRef.current!, newFramePts))

            // move shape to new position
            const next = ++index
            const matsToNext = matrices.slice(0, next).map(m => parseMatrixValues(m.values))
            currentPointsRef.current = applyMatrixChain(originalPointsRef.current, matsToNext)
            updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
            setApplyError(null)
        } catch (err) {
            setApplyError(err instanceof Error ? err.message : 'Could not apply matrices')
        } 
    }

    const handleNewShape = () => {
        if (shapeMeshRef.current) {
            sceneRef.current!.remove(shapeMeshRef.current)
            shapeMeshRef.current.geometry.dispose()
            shapeMeshRef.current = null
        }

        for (let i = 0; i < wireframesRef.current.length; i++) {
            sceneRef.current!.remove(wireframesRef.current[i])
            wireframesRef.current[i].geometry.dispose();
            (wireframesRef.current[i].material as THREE.Material).dispose()
        }

        stateRef.current = 'idle'
        setDemoState('idle')
        setMatrices([])
        setApplyError(null)
    }

    const disposeWireframes = () => {
        for (let i = 0; i < wireframesRef.current.length; i++) {
                sceneRef.current!.remove(wireframesRef.current[i])
                wireframesRef.current[i].geometry.dispose();
                (wireframesRef.current[i].material as THREE.Material).dispose()
            }
    }

    return {
        initShape,
        addMatrix,
        reorderMatrices,
        applyTransformsToIndex,
        handleNewShape,
        matrices,
        handleMatrixEdit,
        applyError,
        disposeWireframes
    }
}