import { useCallback, useRef, useState } from 'react'
import * as THREE from 'three'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import type { MatrixData, Point2D } from '../../lib/types'

import {
    applyMatrixChain,
    parseMatrixValues
} from '../../lib/2d-shapes/applyTransform'
import { updateShapeMesh } from '../../lib/2d-shapes/updateShapeMesh'
import { createWireframe } from '../../lib/2d-shapes/createWireFrame'

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

    // matrices are now the source of truth for the shape's position: adding
    // one (or editing one) just changes this list. The shape itself only
    // moves when handleApplyMatrices replays the whole list from scratch.
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

    // Explicit apply step: re-derive the shape from the ORIGINAL points by
    // replaying every matrix currently in the list, in order. This keeps
    // the shape consistent even if an earlier matrix in the chain was the
    // one that got edited.
    const handleApplyMatrices = () => {
        try {
            disposeWireframes()

            const numericMatrices = matrices.map(m => parseMatrixValues(m.values))

            // create wireframes showing the different steps to get to current position.
            wireframesRef.current.push(createWireframe(sceneRef.current!, originalPointsRef.current!))
            for (let i = 0; i < numericMatrices.length; i++) {
                const matrixIMatrices = numericMatrices.slice(0, i)
                const pointsI = applyMatrixChain(originalPointsRef.current, matrixIMatrices)
                wireframesRef.current.push(createWireframe(sceneRef.current!, pointsI))
            }

            const newPoints = applyMatrixChain(originalPointsRef.current, numericMatrices)
            currentPointsRef.current = newPoints
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
        handleApplyMatrices,
        handleNewShape,
        matrices,
        handleMatrixEdit,
        applyError,
        disposeWireframes
    }
}