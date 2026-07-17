import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { useGrid } from './useGrid';
import type { Font } from 'three/addons/loaders/FontLoader.js'
import { colorToNumber, getFont, polarDecompose } from '../../lib/utilFunctions';
import { useVectors } from './useVectors';
import type { ActiveAnimation, Point3D } from '../../lib/types';
import { determinant3x3, interpolatedTransform, lerpMatrix, lerpVector, multiplyMatrixVector } from '../../lib/3d-vectors/interpolateTransform';

function computeOrthoFrustum(frustumSize: number, aspect: number) {
    return {
        left: -frustumSize * aspect / 2,
        right: frustumSize * aspect / 2,
        top: frustumSize / 2,
        bottom: -frustumSize / 2
    }
}

export function useTransformationPage() {
    // refs used for Three.js objects
    const mountRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const activeCameraRef = useRef<'2d' | '3d'>('3d')
    const controlsRef = useRef<OrbitControls | null>(null)
    const activeAnimationsRef = useRef<ActiveAnimation[]>([])

    // refs & constants for internal usage/logic
    const zoomDirtyRef = useRef(false)
    const pendingDirectionRef = useRef<'in' | 'out'>('in')
    const scrollAccumRef = useRef(0)
    const SCROLL_THRESHOLD = 50  // tune this value

    // camera constants
    const CAM_3D = 0
    const CAM_2D = 1
    const CAM_NEAR = 0.1
    const CAM_FAR = 1000
    const FRUSTUM_SIZE = 24

    // values needed by useGrid & useVectors
    const REAL_GRID_SIZE = 10
    const gridSizeRef = useRef<number>(5)
    const cachedFontRef = useRef<Font | null>(null)

    const {
        drawAxes,
        setZLblVisible,
        setAxisLabelAngles,
        drawGrid,
        disposeAllGridObjects,
        resizeGrid,
        drawTransformGrid
    } = useGrid({ REAL_GRID_SIZE, gridSizeRef, cachedFontRef })

    const {
        setUserVector:   _setUserVector,
        clearUserVector: _clearUserVector,
        setResultVector:   _setResultVector,
        clearResultVector: _clearResultVector,
        setResultPgram:    _setResultPgram,
        clearResultPgram:  _clearResultPgram,
        redrawVectors,
        disposeVectors,
        setVectorLabelAngles
    } = useVectors({ REAL_GRID_SIZE, gridSizeRef, cachedFontRef })

    // these functions eliminate the need to pass sceneRef around through several hooks.
    const setUserVector = (idx: number, x: number, y: number, z: number, color: string, name: string) =>
        _setUserVector(sceneRef.current!, idx, x, y, z, colorToNumber(color), name)

    const clearUserVector = (idx: number) =>
        _clearUserVector(sceneRef.current!, idx)

    const setResultVector = (idx: number, x: number, y: number, z: number, color: string, name: string) =>
        _setResultVector(sceneRef.current!, idx, x, y, z, colorToNumber(color), name)

    const clearResultVector = (idx: number) =>
        _clearResultVector(sceneRef.current!, idx)

    const setResultPgram = (idx: number, u: Point3D, v: Point3D, sum: Point3D, color: string) =>
        _setResultPgram(sceneRef.current!, idx, u, v, sum, colorToNumber(color))

    const clearResultPgram = (idx: number) =>
        _clearResultPgram(sceneRef.current!, idx)

    const startResultAnimation = (
        idx: number,
        vFrom: number[],
        vTo: number[],
        Aprev: number[][],
        Anext: number[][],
        color: string,
        name: string,
        duration = 700
    ) => {
        const isProper = determinant3x3(Aprev) >= -1e-9 && determinant3x3(Anext) >= -1e-9

        const { R: Rfrom, S: Sfrom } = polarDecompose(Aprev)
        const { R: Rto, S: Sto } = polarDecompose(Anext)

        activeAnimationsRef.current = activeAnimationsRef.current.filter(a => a.idx !== idx)
        activeAnimationsRef.current.push({
            idx, vFrom, vTo, Aprev, Anext, Rfrom, Sfrom, Rto, Sto, isProper,
            startTime: performance.now(),
            duration,
            color,
            name
        })
    }

    
    const setCameraPosition = (position: number) => {
        if (!controlsRef.current) return
        
        if (position === CAM_3D) {
            setZLblVisible(true)
            controlsRef.current.enabled = true
            activeCameraRef.current = '3d'
        
        } else if (position === CAM_2D) {
            setZLblVisible(false)
            controlsRef.current.enabled = false
            activeCameraRef.current = '2d'
        
        }
    }

    useEffect(() => {
        const mount = mountRef.current!
        let cancelled = false

        const width = mount.clientWidth
        const height = mount.clientHeight

        const renderer = new THREE.WebGLRenderer()
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(width, height)
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        sceneRef.current = scene

        scene.background = new THREE.Color(0x002233)

        // PerspectiveCamera for 3D view
        const perspCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        perspectiveCameraRef.current = perspCamera;
        perspCamera.position.set(4, -17, 15)
        perspCamera.up.set(0, 0, 1)
        perspCamera.lookAt(new THREE.Vector3(0, 0, 0))

        // OrthographicCamera for 2D view—ensures vectors have the correct length.
        const aspect = width / height
        const { left, right, top, bottom } = computeOrthoFrustum(FRUSTUM_SIZE, aspect)
        const orthoCamera = new THREE.OrthographicCamera(left, right, top, bottom, CAM_NEAR, CAM_FAR)
        orthoCamera.position.set(0, 0, 17)
        orthoCamera.lookAt(new THREE.Vector3(0, 0, 0))
        orthoCameraRef.current = orthoCamera

        // update cameras on window resize
        const resizeObserver = new ResizeObserver(() => {
            const width = mount.clientWidth
            const height = mount.clientHeight
            const aspect = width / height
            renderer.setSize(width, height)

            // Perspective camera
            perspCamera.aspect = aspect
            perspCamera.updateProjectionMatrix()

            // Orthographic camera — recalculate frustum on resize
            if (orthoCameraRef.current) {
                const { left, right, top, bottom } = computeOrthoFrustum(FRUSTUM_SIZE, aspect)
                orthoCameraRef.current.left = left
                orthoCameraRef.current.right = right
                orthoCameraRef.current.top = top
                orthoCameraRef.current.bottom = bottom
                orthoCameraRef.current.updateProjectionMatrix()
            }
        })
        resizeObserver.observe(mount)

        controlsRef.current = new OrbitControls(perspCamera, renderer.domElement)
        controlsRef.current.enableZoom = false
        controlsRef.current.enablePan = false

        // const transform = [
        //     [1, 2, 0],
        //     [3, 1, 0],
        //     [0, 0, 1]
        // ]

        // drawTransformGrid(scene, transform)

        async function loadFont() {
            const font = await getFont()
            if (cancelled) return
            
            cachedFontRef.current = font

            // grid & axes depend on font for label creation
            // so we put them here to ensure it's loaded
            drawGrid(scene)
            drawAxes(scene)
        }
        loadFont()
        
        // event listener for custom zoom controls
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            scrollAccumRef.current += e.deltaY

            if (Math.abs(scrollAccumRef.current) >= SCROLL_THRESHOLD) {
                pendingDirectionRef.current = scrollAccumRef.current > 0 ? 'out' : 'in'
                zoomDirtyRef.current = true
                scrollAccumRef.current = 0
            }
        }

        mount.addEventListener('wheel', handleWheel, { passive: false })

        let animationId: number

        function animate() {
            animationId = requestAnimationFrame(animate)
            if (controlsRef.current) {
                controlsRef.current.update()
            }

            if (zoomDirtyRef.current) {
                zoomDirtyRef.current = false
                const direction = pendingDirectionRef.current
                resizeGrid(direction, scene)
                redrawVectors(scene)
            }

            const is3D = activeCameraRef.current === '3d'
            const activeCamera = is3D ? perspCamera : orthoCamera

            setAxisLabelAngles(activeCamera)
            setVectorLabelAngles(activeCamera)

            const now = performance.now()
            activeAnimationsRef.current = activeAnimationsRef.current.filter((anim) => {
                const t = Math.min(1, (now - anim.startTime) / anim.duration)
                const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

                const M = anim.isProper
                    ? interpolatedTransform(anim.Rfrom, anim.Sfrom, anim.Rto, anim.Sto, eased)
                    : lerpMatrix(anim.Aprev, anim.Anext, eased)

                const vNow = lerpVector(anim.vFrom, anim.vTo, eased)
                const [x, y, z] = multiplyMatrixVector(M, vNow)
                setResultVector(anim.idx, x, y, z, anim.color, anim.name)

                return t < 1
            })

            renderer.render(scene, activeCamera)
        }

        animate();

        return () => {
            cancelled = true
            cancelAnimationFrame(animationId)
            try {
                controlsRef.current?.dispose()
                resizeObserver.disconnect()
                disposeAllGridObjects(scene)
                disposeVectors(scene)
                mount.removeEventListener('wheel', handleWheel)
                renderer.dispose()
                mount.removeChild(renderer.domElement)
            } catch (err) {
                console.error("Cleanup error:", err)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        mountRef,
        setCameraPosition,
        CAM_3D,
        CAM_2D,
        startResultAnimation,
        setUserVector,
        clearUserVector,
        setResultVector,
        clearResultVector,
        setResultPgram,
        clearResultPgram
    }
}