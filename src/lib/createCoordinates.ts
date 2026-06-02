import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from './makeLabel'

export async function createCoordinates(
    scene: THREE.Scene,
    step: number,
    numLabels: number,
    color: number
): Promise<THREE.Mesh[]> {
    let axis = 'x' as 'x' | 'y' | 'z'
    const loader = new FontLoader()
    const font = await loader.loadAsync(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
    )

    const coords: THREE.Mesh[] = []

    for (let i = 0; i < 3; i++) {
        for (let j = -step * (numLabels - 1); j < step * numLabels; j += step) {
            if (i === 0 && j === 0) {       // ensure we only create one zero.
                coords.push(makeLabel(j + '', color, { x: -0.4, y: -0.4, z: 0 }, font))
            
            } else if (j !== 0) {
                let coord: THREE.Mesh; // only used if axis == 'z' because we need to set the rotation then.
                let offset = 0.35
                if (j < 0)
                    offset = 0.45
                switch(axis) {
                    case 'x':
                        coords.push(makeLabel(j + '', color, { x: j - offset, y: -0.4, z: 0 }, font))
                        break
                    case 'y':
                        coords.push(makeLabel(j + '', color, { x: -offset, y: j - 0.4, z: 0 }, font))
                        break
                    case 'z':
                        coord = makeLabel(j + '', color, { x: -offset, y: 0, z: j }, font)
                        coord.setRotationFromAxisAngle(
                            new THREE.Vector3(1, 0, 0),
                            Math.PI / 2
                        )
                        coords.push(coord)
                        break
                }
            }
            
        }

        if (axis === 'x') {
            axis = 'y'
        
        } else if (axis === 'y') {
            axis = 'z'
        }
    }

    scene.add(...coords)
    return coords
}