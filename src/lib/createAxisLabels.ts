import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

export async function createAxisLabels(
    scene: THREE.Scene,
    size: number,
    xColor: number,
    yColor: number,
    zColor: number
): Promise<{xLbl: THREE.Mesh, yLbl: THREE.Mesh, zLbl: THREE.Mesh}> {
    const loader = new FontLoader()
    const font = await loader.loadAsync(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
    )
    
    function makeLabel(text: string, color: number, x: number, y: number, z: number) {
        const geometry = new TextGeometry(text, {
            font,
            size: 0.4,
            depth: 0.05
        })

        geometry.center()
    
        const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ color })
        )
    
        mesh.position.set(x, y, z)
        return mesh
    }
    
    const xLbl = makeLabel('X', xColor, size + 0.5, 0,          0)
    const yLbl = makeLabel('Y', yColor, 0,          size + 0.5, 0)
    const zLbl = makeLabel('Z', zColor, 0,          0,          size + 0.5)

    scene.add(xLbl, yLbl, zLbl)
    return { xLbl, yLbl, zLbl }
}