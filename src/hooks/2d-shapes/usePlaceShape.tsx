import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { ShapesPageState, Point2D } from '../../lib/types'
import { clearPreview } from '../../lib/2d-shapes/clearPreview'
import { createShape } from '../../lib/2d-shapes/createShape'
import { getGridPoint } from '../../lib/2d-shapes/getGridPoint'

interface UsePlaceShapeProps {
    sceneRef: React.RefObject<THREE.Scene | null>
    stateRef: React.RefObject<ShapesPageState>
    setDemoState: (state: string) => void
    onShapeConfirmed: (mesh: THREE.Mesh, points: Point2D[]) => void
}

export function usePlaceShape({ sceneRef, stateRef, setDemoState, onShapeConfirmed }: UsePlaceShapeProps) {
    const [pointCount, setPointCount] = useState(0)
    const placedPointsRef = useRef<Point2D[]>([])
    const previewDotsRef = useRef<THREE.Mesh[]>([])
    const previewLineRef = useRef<THREE.Line | null>(null)

    // keep the ref in sync with state so Three.js handlers see current value
    const handleTogglePlacing = () => {
        if (stateRef.current === 'idle') {
            // start placing
            stateRef.current = 'placing'
            setDemoState('placing')
                
        } else if (stateRef.current === 'placing') {
            // confirm shape — need at least 3 points
            if (placedPointsRef.current.length < 3) return
            
            const mesh = createShape(sceneRef.current!, placedPointsRef.current)
            const confirmedPoints = [...placedPointsRef.current]

            clearPreview(sceneRef.current!, previewDotsRef.current!, previewLineRef.current)
            placedPointsRef.current = []
            setPointCount(0)
                    
            stateRef.current = 'transforming'
            setDemoState('transforming')

            // notify parent with the new mesh and points
            onShapeConfirmed(mesh, confirmedPoints)
        }
    }

    const handleCancelPlacing = () => {
        clearPreview(sceneRef.current!, previewDotsRef.current!, previewLineRef.current)
        placedPointsRef.current = []
        setPointCount(0)
        stateRef.current = 'idle'
        setDemoState('idle')
    }

    const setupCanvasHandlers = (mount: HTMLDivElement, camera: THREE.OrthographicCamera) => {
        // --- display which point will be selected if user clicks ---
        let point: Point2D
        
        const previewDotGeometry = new THREE.CircleGeometry(0.1, 16)
        const previewDotMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 })
        const previewDot = new THREE.Mesh(previewDotGeometry, previewDotMaterial)
        previewDot.visible = false  // hidden until placing starts
        sceneRef.current!.add(previewDot)
        
        const handleMouseMove = (event: MouseEvent) => {
            if (stateRef.current !== 'placing') {
                previewDot.visible = false
                return
            }
        
            point = getGridPoint(event, mount, camera)
            previewDot.position.set(point.x, point.y, 0.1)
            previewDot.visible = true
        }

        // --- handle canvas clicks for placing shape points ---
        const handleCanvasClick = (event: MouseEvent) => {
            if (stateRef.current !== 'placing') return

            // add a small dot at the clicked point
            const dot = new THREE.Mesh(
                new THREE.CircleGeometry(0.1, 16),
                new THREE.MeshBasicMaterial({ color: 0xff6600 })
            )
            dot.position.set(point.x, point.y, 0.1) // slightly in front of grid
            sceneRef.current!.add(dot)
            previewDotsRef.current.push(dot)
            placedPointsRef.current.push(point)
            setPointCount(placedPointsRef.current.length)

            // update preview line connecting all placed points
            if (previewLineRef.current) {
                sceneRef.current!.remove(previewLineRef.current)
                previewLineRef.current.geometry.dispose()
            }

            if (placedPointsRef.current.length > 1) {
                const linePoints = placedPointsRef.current.map(
                    p => new THREE.Vector3(p.x, p.y, 0.1)
                )
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
                previewLineRef.current = new THREE.Line(
                    lineGeometry,
                    new THREE.LineBasicMaterial({ color: 0xff6600 })
                )
                sceneRef.current!.add(previewLineRef.current)
            }
        }

        mount.addEventListener('mousemove', handleMouseMove)
        mount.addEventListener('click', handleCanvasClick)
    }

    return {
        pointCount,
        handleTogglePlacing,
        handleCancelPlacing,
        setupCanvasHandlers
    }
}