import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { MatrixData, Point2D, TransformationData, TransformationType } from '../../lib/types'
import {
    applyMatrixChain,
    parseMatrixValues
} from '../../lib/2d-shapes/applyTransform'
import { updateShapeMesh } from '../../lib/2d-shapes/updateShapeMesh'

interface UseTransformShapeProps {
    sceneRef: React.RefObject<THREE.Scene | null>
    setDemoState: (state: string) => void
    stateRef: React.RefObject<string>
}

function toMatrixData(name: string, m: number[][]): MatrixData {
    return {
        name,
        values: m.map(row => row.map(v => (Number.isInteger(v) ? v.toString() : v.toFixed(2))))
    }
}

export function useTransformShape({ sceneRef, setDemoState, stateRef }: UseTransformShapeProps) {
    const shapeMeshRef = useRef<THREE.Mesh | null>(null)
    const originalPointsRef = useRef<Point2D[]>([])
    const currentPointsRef = useRef<Point2D[]>([])

    // matrices are now the source of truth for the shape's position: adding
    // one (or editing one) just changes this list. The shape itself only
    // moves when handleApplyMatrices replays the whole list from scratch.
    const [matrices, setMatrices] = useState<MatrixData[]>([])
    const [applyError, setApplyError] = useState<string | null>(null)

    const addMatrix = (label: string, m: number[][]) => {
        setMatrices(prev => [...prev, toMatrixData(`${label}`, m)])
    }

    // called by usePlaceShape via onShapeConfirmed
    const initShape = (mesh: THREE.Mesh, points: Point2D[]) => {
        shapeMeshRef.current = mesh
        originalPointsRef.current = [...points]
        currentPointsRef.current = [...points]
    }

    // Presets: build a matrix from the typed inputs and queue it up. This no
    // longer touches the shape -- it only appears in the editable matrix
    // list until the user hits Apply.
    const handleTransform = (type: TransformationType, data: TransformationData) => {
        // switch (type) {
        //     case 'translation':
        //         // assert that tx and ty exist because in this case they should
        //         // temporary anyways while I refactor.
        //         addMatrix('Translation', buildTranslationMatrix(data.tx!, data.ty!))
        //         break
        //     case 'dilation':
        //         addMatrix('Dilation', buildDilationMatrix(data.k!))
        //         break
        //     case 'rotation':
        //         addMatrix('Rotation', buildRotationMatrix(data.t!))
        //         break
        //     case 'reflection':
        //         addMatrix('Reflection', buildReflectionMatrix(data.rfX!, data.rfY!))
        //         break
        // }
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
            const numericMatrices = matrices.map(m => parseMatrixValues(m.values))
            const newPoints = applyMatrixChain(originalPointsRef.current, numericMatrices)
            currentPointsRef.current = newPoints
            updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
            setApplyError(null)
        } catch (err) {
            setApplyError(err instanceof Error ? err.message : 'Could not apply matrices')
        }
    }

    const handleReset = () => {
        currentPointsRef.current = [...originalPointsRef.current]
        updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
        setMatrices([])
        setApplyError(null)
    }

    const handleNewShape = () => {
        if (shapeMeshRef.current) {
            sceneRef.current!.remove(shapeMeshRef.current)
            shapeMeshRef.current.geometry.dispose()
            shapeMeshRef.current = null
        }

        stateRef.current = 'idle'
        setDemoState('idle')
        setMatrices([])
        setApplyError(null)
    }

    return {
        initShape,
        addMatrix,
        handleTransform,
        handleApplyMatrices,
        handleReset,
        handleNewShape,
        matrices,
        handleMatrixEdit,
        applyError
    }
}