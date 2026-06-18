import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { useGrid } from './useGrid';
import type { AxisLabelsObject } from '../lib/types';
import type { Font } from 'three/addons/loaders/FontLoader.js'
import { getFont } from '../lib/getFont';

// TODO: Store vectors (maybe new type of Point3D & the Vector? Maybe also need new type to hold the three parts of the vector.)
// TODO: Start work on transformations.

export function useTransformationPage() {
    const mountRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const activeCameraRef = useRef<'2d' | '3d'>('3d')
    const controlsRef = useRef<OrbitControls | null>(null)
    const axisLabelsRef = useRef<AxisLabelsObject | null>(null)
    const lastZoomTime = useRef(0) // prevents the custom scroll function from working too fast on trackpads
    const cachedFontRef = useRef<Font | null>(null)

    // camera position constants
    const CAM_3D = 0
    const CAM_2D = 1

    const {
        drawAxes,
        drawGrid,
        disposeAllGridObjects,
        resizeGrid,
        setMatrixVector,
        clearMatrixVector,
        setResultVector,
        clearResultVector,
        setResultPgram,
        clearResultPgram,
        setLabelAngles
    } = useGrid({ sceneRef, axisLabelsRef, cachedFontRef })

    const setCameraPosition = (position: number) => {
        if (!axisLabelsRef.current || !controlsRef.current) return
        
        if (position === CAM_3D) {
            axisLabelsRef.current.zLbl.visible = true
            controlsRef.current.enabled = true
            activeCameraRef.current = '3d'
        
        } else if (position === CAM_2D) {
            axisLabelsRef.current.zLbl.visible = false
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
        const camera = new THREE.PerspectiveCamera(
          75,
          width / height,
          0.1,
          1000
        )
        perspectiveCameraRef.current = camera;

        camera.position.set(4, -17, 15)
        camera.up.set(0, 0, 1)
        camera.lookAt(new THREE.Vector3(0, 0, 0))

        // OrthographicCamera for 2D view—ensures vectors have the correct length.
        const frustumSize = 24
        const aspect = width / height
        const orthoCamera = new THREE.OrthographicCamera(
            -frustumSize * aspect / 2,   // left
            frustumSize * aspect / 2,   // right
            frustumSize / 2,            // top
            -frustumSize / 2,            // bottom
            0.1,
            1000
        )
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
            camera.aspect = aspect
            camera.updateProjectionMatrix()

            // Orthographic camera — recalculate frustum on resize
            if (orthoCameraRef.current) {
                orthoCameraRef.current.left   = -frustumSize * aspect / 2
                orthoCameraRef.current.right  =  frustumSize * aspect / 2
                orthoCameraRef.current.top    =  frustumSize / 2
                orthoCameraRef.current.bottom = -frustumSize / 2
                orthoCameraRef.current.updateProjectionMatrix()
            }
        })
        resizeObserver.observe(mount)

        controlsRef.current = new OrbitControls(camera, renderer.domElement)
        controlsRef.current.enableZoom = false

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

            const now = Date.now()
            if (now - lastZoomTime.current < 85) return
            lastZoomTime.current = now

            const direction = e.deltaY > 0 ? 'out' : 'in'
            resizeGrid(direction, scene)
        }

        mount.addEventListener('wheel', handleWheel, { passive: false })

        let animationId: number

        function animate() {
            animationId = requestAnimationFrame(animate)
            if (controlsRef.current) {
                controlsRef.current.update()
            }

            const activeCamera = activeCameraRef.current === '2d' && orthoCameraRef.current
                ? orthoCameraRef.current
                : perspectiveCameraRef.current!

            const is3D = activeCameraRef.current === '3d'
            
            // labelsRef becomes non-null asynchronously.
            if (axisLabelsRef.current) {
                const { xLbl, yLbl, zLbl } = axisLabelsRef.current

                xLbl.quaternion.copy(is3D ? camera.quaternion : orthoCamera.quaternion)
                yLbl.quaternion.copy(is3D ? camera.quaternion : orthoCamera.quaternion)
                if (is3D) {
                    zLbl.quaternion.copy(camera.quaternion)
                }
            }

            setLabelAngles(is3D, camera, orthoCamera)

            renderer.render(scene, activeCamera)
        }

        animate();

        return () => {
            cancelled = true
            cancelAnimationFrame(animationId)
            if(controlsRef.current) {
                controlsRef.current.dispose()
            }
            resizeObserver.disconnect()

            disposeAllGridObjects(scene)
            mount.removeEventListener('wheel', handleWheel)

            renderer.dispose()
            mount.removeChild(renderer.domElement)
        }
    }, [])

    return {
        mountRef,
        setCameraPosition,
        CAM_3D,
        CAM_2D,
        setMatrixVector,
        clearMatrixVector,
        setResultVector,
        clearResultVector,
        setResultPgram,
        clearResultPgram
    }
}