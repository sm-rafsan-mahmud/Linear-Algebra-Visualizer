import { useEffect, useRef, useState} from 'react'
import * as THREE from 'three'
import { usePlaceShape } from './usePlaceShape'
import { useTransformShape } from './useTransformShape'
import type { ShapesPageState } from '../../lib/types'
import { createGrid2D } from '../../lib/2d-shapes/createGrid2D'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export function useShapesPage() {
    const mountRef = useRef<HTMLDivElement>(null)
    const [demoState, setDemoState] = useState('idle')

    const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const stateRef = useRef<ShapesPageState>('idle')

    const {
        initShape,
        addMatrix,
        removeMatrix,
        reorderMatrices,
        applyTransformsToIndex,
        handleNewShape,
        matrices,
        handleMatrixEdit,
        applyError,
        disposeWireframes,
        updateMatrixColor
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
        scene.background = new THREE.Color(0x002233)
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
            camera.updateProjectionMatrix()
            renderer.setSize(mount.clientWidth, mount.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableRotate = false
        controls.enableDamping = false
        controls.screenSpacePanning = true
        controls.minZoom = 0.25
        controls.maxZoom = 0.75
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        controls.touches = {
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN,
        };

        const gridStep = 1
        const majorGridStep = gridStep * 5
        const gridSizeX = 100
        const gridSizeY = 100

        const gridObjects = createGrid2D(scene, gridSizeX, gridSizeY, gridStep, 0xaaaaaa)
        const majorGridObjects = createGrid2D(scene, gridSizeX, gridSizeY, majorGridStep, 0xffffff)

        // delegate canvas handler setup to usePlaceShape, get back its cleanup
        const cleanupCanvasHandlers = setupCanvasHandlers(mount, camera)

        const panLimit = 10
        function clampPan() {
            const target = controls.target;
            const clampedX = THREE.MathUtils.clamp(target.x, -panLimit, panLimit);
            const clampedY = THREE.MathUtils.clamp(target.y, -panLimit, panLimit);

            const hitBound = clampedX !== target.x || clampedY !== target.y;

            const dx = clampedX - target.x;
            const dy = clampedY - target.y;

            target.x += dx;
            target.y += dy;
            camera.position.x += dx;
            camera.position.y += dy;

            return hitBound;
        }


        let animFrameID: number
        function animate() {
            animFrameID = requestAnimationFrame(animate)
            renderer.render(scene, camera)

            clampPan()
            controls.update();
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

            disposeWireframes()

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
        removeMatrix,
        reorderMatrices,
        applyTransformsToIndex,
        handleNewShape,
        matrices,
        handleMatrixEdit,
        applyError,
        updateMatrixColor
    }
}