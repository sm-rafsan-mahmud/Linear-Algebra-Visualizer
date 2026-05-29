import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { createGrid } from '../lib/createGrid';
import { createAxes } from '../lib/createAxes';
import { createVector } from '../lib/createVector';

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

    const newVector = (x: number, y: number, z: number) => {
        createVector(sceneRef.current!, {x, y, z}, getRandomColor())
    }

    useEffect(() => {
        const mount = mountRef.current!

        const width = mount.clientWidth
        const height = mount.clientHeight

        const renderer = new THREE.WebGLRenderer()
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

        const axishelper = new THREE.AxesHelper(5)
        scene.add(axishelper)

        // grid & axes
        const gridObjects = createGrid(scene, 10, 1)
        const axes = createAxes(scene, 10, 0xff0000, 0x00ff00, 0x0000ff)

        let animationId: number

        function animate() {
            animationId = requestAnimationFrame(animate)
            controls.update()

            renderer.render(scene, camera)
        }

        animate();

        return () => {
            cancelAnimationFrame(animationId)
            controls.dispose()
            resizeObserver.disconnect()

            scene.remove(gridObjects)
            scene.remove(axes.xAxis, axes.yAxis, axes.zAxis)

            renderer.dispose()
            mount.removeChild(renderer.domElement)
        }
    }, [])

    return {
        mountRef,
        newVector
    }
}