import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { useGrid } from './useGrid';
import type { AxisLabelsObject } from '../lib/types';

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
    const isMountedRef = useRef<boolean>(false)
    const lastZoomTime = useRef(0) // prevents the custom scroll function from working too fast on trackpads

    // camera position constants
    const CAM_3D = 0
    const CAM_2D = 1

    const {
        drawAxes,
        drawGrid,
        disposeAllGridObjects,
        resizeGrid,
        newVector,
        applyScalarMultiply,
        applyVectorAdd
    } = useGrid({ sceneRef, axisLabelsRef, isMountedRef })

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
        isMountedRef.current = true

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

        // grid & axes
        drawGrid()
        drawAxes()
        
        // event listener for custom zoom controls
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()

            const now = Date.now()
            if (now - lastZoomTime.current < 85) return
            lastZoomTime.current = now

            const direction = e.deltaY > 0 ? 'out' : 'in'
            resizeGrid(direction)
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

            // labelsRef becomes non-null asynchronously.
            if (axisLabelsRef.current) {
                const { xLbl, yLbl, zLbl } = axisLabelsRef.current
                const is3D = activeCameraRef.current === '3d'

                xLbl.quaternion.copy(is3D ? camera.quaternion : orthoCamera.quaternion)
                yLbl.quaternion.copy(is3D ? camera.quaternion : orthoCamera.quaternion)
                if (is3D) {
                    zLbl.quaternion.copy(camera.quaternion)
                }

            }

            renderer.render(scene, activeCamera)
        }

        animate();

        return () => {
            isMountedRef.current = false
            cancelAnimationFrame(animationId)
            if(controlsRef.current) {
                controlsRef.current.dispose()
            }
            resizeObserver.disconnect()

            disposeAllGridObjects()
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
        newVector,
        applyScalarMultiply,
        applyVectorAdd
    }
}