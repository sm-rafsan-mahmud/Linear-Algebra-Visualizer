import { useEffect, useRef, useState} from 'react'
import * as THREE from 'three'
import { usePlaceShape } from './usePlaceShape'
import { useTransformShape } from './useTransformShape'
import type { ShapesPageState } from '../../lib/types'
import { createAxes2D } from '../../lib/2d-shapes/createAxes2D'
import { createGrid2D } from '../../lib/2d-shapes/createGrid2D'

export function useShapesPage() {
    const mountRef = useRef<HTMLDivElement>(null)
    const [demoState, setDemoState] = useState('idle')

    const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const stateRef = useRef<ShapesPageState>('idle')

    const {
        initShape,
        addMatrix,
        handleTransform,
        handleApplyMatrices,
        handleReset,
        handleNewShape,
        matrices,
        handleMatrixEdit,
        applyError
    } = useTransformShape({
        sceneRef,
        setDemoState,
        stateRef
    })

    const {
        pointCount,
        handleTogglePlacing,
        handleCancelPlacing,
        setupCanvasHandlers
    } = usePlaceShape({
        sceneRef,
        stateRef,
        setDemoState,
        onShapeConfirmed: initShape
    });

    useEffect(() => {
        const mount = mountRef.current!
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xffffff)
        sceneRef.current = scene
        
        const aspect = mount.clientHeight > 0 ? mount.clientWidth / mount.clientHeight : 1
        const frustumSize = 20
        const camera = new THREE.OrthographicCamera(
            (-frustumSize * aspect) / 2, // left
            (frustumSize * aspect) / 2, // right
            frustumSize / 2, // top
            -frustumSize / 2, // bottom
            0.1, // near
            1000 // far
        );
        camera.position.set(0, 0, 10)
        cameraRef.current = camera

        const handleResize = () => {
            const aspect = mount.clientHeight > 0 ? mount.clientWidth / mount.clientHeight : 1
            camera.left = (-frustumSize * aspect) / 2
            camera.right = (frustumSize * aspect) / 2
            camera.top = frustumSize / 2
            camera.bottom = -frustumSize / 2
            camera.updateProjectionMatrix() // critical — always call this after changing camera params
            renderer.setSize(mount.clientWidth, mount.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        const gridStep = 1
        const majorGridStep = gridStep * 5
        const gridSizeX = Math.ceil((frustumSize * aspect) / 2 / majorGridStep) * majorGridStep
        const gridSizeY = Math.ceil((frustumSize) / 2 / majorGridStep) * majorGridStep

        const gridObjects = createGrid2D(scene, gridSizeX, gridSizeY, gridStep, 0x444444)
        const majorGridObjects = createGrid2D(scene, gridSizeX, gridSizeY, majorGridStep, 0x000000)
        const axes = createAxes2D(sceneRef.current, gridSizeX, gridSizeY, 0xff0000, 0x0000ff)

        // delegate canvas handler setup to usePlaceShape, get back its cleanup
        const cleanupCanvasHandlers = setupCanvasHandlers(mount, camera)

        let animFrameID: number
        function animate() {
            animFrameID = requestAnimationFrame(animate)
            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(animFrameID)
            window.removeEventListener('resize', handleResize)
            cleanupCanvasHandlers()
            scene.remove(gridObjects)
            gridObjects.geometry.dispose();
            (gridObjects.material as THREE.Material).dispose()
            scene.remove(majorGridObjects)
            majorGridObjects.geometry.dispose();
            (majorGridObjects.material as THREE.Material).dispose()
            scene.remove(axes.xAxis, axes.yAxis)
            axes.xAxis.geometry.dispose();
            (axes.xAxis.material as THREE.Material).dispose()
            axes.yAxis.geometry.dispose();
            (axes.yAxis.material as THREE.Material).dispose()

            mount.removeChild(renderer.domElement)
            renderer.dispose()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        mountRef,
        demoState,
        pointCount,
        handleTogglePlacing,
        handleCancelPlacing,
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