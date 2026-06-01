import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { createGrid } from '../lib/createGrid';
import { createAxes } from '../lib/createAxes';
import { createVector } from '../lib/createVector';
import { createAxisLabels } from '../lib/createAxisLabels';

function getRandomColor() {
  const h = Math.random() * 360         // any hue
  const s = 100                         // 100% saturations
  const l = 55 + Math.random() * 20     // 55–75% lightness

  // HSL → RGB conversion
  const a = s / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  };

  const r = f(0)
  const g = f(8)
  const b = f(4)

  // Pack into a single integer the way Three.js expects
  return (r << 16) | (g << 8) | b
}

// TODO: Store vectors (maybe new type of Point3D & the Vector? Maybe also need new type to hold the three parts of the vector.)
// TODO: Start work on transformations.

export function useTransformations() {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null)
    const activeCameraRef = useRef<'2d' | '3d'>('3d')
    const controlsRef = useRef<OrbitControls | null>(null)
    const labelsRef = useRef<{ xLbl: THREE.Mesh, yLbl: THREE.Mesh, zLbl: THREE.Mesh }>(null)
    const zAxisRef = useRef<Line2 | null>(null) // only need the zAxis one because the other two are unchanging (may change)
    
    // camera position constants
    const CAM_3D = 0
    const CAM_2D = 1

    const newVector = (x: number, y: number, z: number) => {
        createVector(sceneRef.current!, {x, y, z}, getRandomColor())
    }

    const setCameraPosition = (position: number) => {
        if (position === CAM_3D) {
            labelsRef.current!.zLbl.visible = true
            zAxisRef.current!.visible = true
            controlsRef.current!.enabled = true
            activeCameraRef.current = '3d'
        
        } else if (position === CAM_2D) {
            labelsRef.current!.zLbl.visible = false
            zAxisRef.current!.visible = false
            controlsRef.current!.enabled = false
            activeCameraRef.current = '2d'
        }
    }

    useEffect(() => {
        const mount = mountRef.current!

        const width = mount.clientWidth
        const height = mount.clientHeight

        const renderer = new THREE.WebGLRenderer()
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(width, height)
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        sceneRef.current = scene

        // PerspectiveCamera for 3D view
        const camera = new THREE.PerspectiveCamera(
          75,
          width / height,
          0.1,
          1000
        )
        perspectiveCameraRef.current = camera;

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
    
        camera.position.set(15, 15, 15)
        camera.up.set(0, 0, 1)
        camera.lookAt(new THREE.Vector3(0, 0, 0))

        controlsRef.current = new OrbitControls(camera, renderer.domElement)

        // grid & axes
        const gridObjects = createGrid(scene, 10, 1, 0xaaaaaa)
        const majorGridObjects = createGrid(scene, 10, 5, 0xffffff)
        const axes = createAxes(scene, 11, 0xff0000, 0x00ff00, 0x0000ff)
        zAxisRef.current = axes.zAxis


        async function initLabels() {
            const axisLabels = await createAxisLabels(scene, 11, 0xff0000, 0x00ff00, 0x0000ff)
            if (!isMounted) {
                scene.remove(axisLabels.xLbl, axisLabels.yLbl, axisLabels.zLbl)
                return
            }
            labelsRef.current = axisLabels
        }

        

        let isMounted = true
        initLabels()

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
            if (labelsRef.current) {
                const { xLbl, yLbl, zLbl } = labelsRef.current
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
            isMounted = false
            cancelAnimationFrame(animationId)
            if(controlsRef.current) {
                controlsRef.current.dispose()
            }
            resizeObserver.disconnect()

            scene.remove(gridObjects)
            scene.remove(majorGridObjects)
            scene.remove(axes.xAxis, axes.yAxis, axes.zAxis)
            
            if (labelsRef.current) {
                scene.remove(labelsRef.current!.xLbl, labelsRef.current!.yLbl, labelsRef.current!.zLbl)
            }

            renderer.dispose()
            mount.removeChild(renderer.domElement)
        }
    }, [])

    return {
        mountRef,
        newVector,
        setCameraPosition,
        CAM_3D,
        CAM_2D
    }
}