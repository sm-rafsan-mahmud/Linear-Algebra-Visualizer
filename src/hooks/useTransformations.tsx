import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";
import { createGrid } from '../lib/createGrid';

export function useTransformations() {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const mount = mountRef.current!
        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()

        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        )
        
        camera.position.z = 5

        const controls = new OrbitControls(camera, renderer.domElement)

        const axishelper = new THREE.AxesHelper(5)
        scene.add(axishelper)

        // grid
        const gridHelper = new THREE.GridHelper(10, 10)
        scene.add(gridHelper)

        function animate() {
            requestAnimationFrame(animate)
            controls.update()

            renderer.render(scene, camera)
        }

        animate();
    })

    return {
        mountRef
    }
}