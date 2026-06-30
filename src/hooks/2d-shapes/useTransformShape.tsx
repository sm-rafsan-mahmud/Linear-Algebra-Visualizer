import { useRef } from 'react'
import * as THREE from 'three'
import type { Point2D } from '../../lib/types'
import { applyTranslation, applyDilation, applyRotation, applyReflection } from '../../lib/2d-shapes/applyTransform'
import { updateShapeMesh } from '../../lib/2d-shapes/updateShapeMesh'

interface UseTransformShapeProps {
    sceneRef: React.RefObject<THREE.Scene | null>
    setDemoState: (state: string) => void
    stateRef: React.RefObject<string>
}

export function useTransformShape({ sceneRef, setDemoState, stateRef }: UseTransformShapeProps) {
    const shapeMeshRef = useRef<THREE.Mesh | null>(null)
    const originalPointsRef = useRef<Point2D[]>([])
    const currentPointsRef = useRef<Point2D[]>([])

    // called by usePlaceShape via onShapeConfirmed
    const initShape = (mesh: THREE.Mesh, points: Point2D[]) => {
        shapeMeshRef.current = mesh
        originalPointsRef.current = [...points]
        currentPointsRef.current = [...points]
    }

    const handleTranslate = (tx: number, ty: number) => {
        currentPointsRef.current = applyTranslation(currentPointsRef.current, tx, ty)
        updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
    }

    const handleDilate = (k: number) => {
        currentPointsRef.current = applyDilation(currentPointsRef.current, k)
        updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
    }

    const handleRotate = (t: number) => {
        currentPointsRef.current = applyRotation(currentPointsRef.current, t)
        updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
    }

    const handleReflect = (rfX: boolean, rfY: boolean) => {
        currentPointsRef.current = applyReflection(currentPointsRef.current, rfX, rfY)
        updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
    }

    const handleReset = () => {
        currentPointsRef.current = [...originalPointsRef.current]
        updateShapeMesh(shapeMeshRef.current!, currentPointsRef.current)
    }

    const handleNewShape = () => {
        if (shapeMeshRef.current) {
            sceneRef.current!.remove(shapeMeshRef.current)
            shapeMeshRef.current.geometry.dispose()
            shapeMeshRef.current = null
        }
                
        stateRef.current = 'idle'
        setDemoState('idle')
    }

    return {
        initShape,
        handleTranslate,
        handleDilate,
        handleRotate,
        handleReflect,
        handleReset,
        handleNewShape
    }
}
