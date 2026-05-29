import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { createGrid } from '../lib/createGrid';
import { createAxes } from '../lib/createAxes';
import { createVector } from '../lib/createVector';
import { createAxisLabels } from '../lib/createAxisLabels';

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '0x';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return parseInt(color, 16);
}

// TODO: Store vectors (maybe new type of Point3D & the Vector? Maybe also need new type to hold the three parts of the vector.)
// TODO: Start work on transformations.

export function useTransformations() {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const labelsRef = useRef<{ xLbl: THREE.Mesh, yLbl: THREE.Mesh, zLbl: THREE.Mesh }>(null)

    const newVector = (x: number, y: number, z: number) => {
        createVector(sceneRef.current!, {x, y, z}, getRandomColor())
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

        const camera = new THREE.PerspectiveCamera(
          75,
          width / height,
          0.1,
          1000
        )

        const resizeObserver = new ResizeObserver(() => {
            const width = mount.clientWidth
            const height = mount.clientHeight
            renderer.setSize(width, height)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
        })
        resizeObserver.observe(mount)
    
        camera.position.set(5, 5, 5)
        camera.up.set(0, 0, 1)
        camera.lookAt(new THREE.Vector3(0, 0, 0))

        const controls = new OrbitControls(camera, renderer.domElement)

        // grid & axes
        const gridObjects = createGrid(scene, 10, 1, 0xaaaaaa)
        const majorGridObjects = createGrid(scene, 10, 5, 0xffffff)
        const axes = createAxes(scene, 11, 0xff0000, 0x00ff00, 0x0000ff)


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
            controls.update()
            // labelsRef becomes non-null asynchronously.
            if (labelsRef.current) {
                const { xLbl, yLbl, zLbl } = labelsRef.current

                xLbl.quaternion.copy(camera.quaternion)
                yLbl.quaternion.copy(camera.quaternion)
                zLbl.quaternion.copy(camera.quaternion)
            }


            renderer.render(scene, camera)
        }

        animate();

        return () => {
            isMounted = false
            cancelAnimationFrame(animationId)
            controls.dispose()
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
        newVector
    }
}