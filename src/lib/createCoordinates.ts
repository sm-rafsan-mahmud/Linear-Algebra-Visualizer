import * as THREE from 'three'
import { Font } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from './makeLabel'

export function createCoordinates(
    scene: THREE.Scene,
    sizeRatio: number,
    step: number,
    numLabels: number,
    font: Font
): THREE.Mesh[] {
    const coords: THREE.Mesh[] = []
    const white = 0xffffff
    
    // x-axis labels
    for (let n = -(numLabels - 1); n < numLabels; n++) {
        const i = parseFloat((n * step).toPrecision(10))
        let offset = 0.35
        if (i < 0)
            offset = 0.45

        coords.push(makeLabel(i + '', white, { x: i * sizeRatio - offset, y: -0.4, z: 0 }, font))
    }

    // y-axis labels
    for (let n = -(numLabels - 1); n < numLabels; n++) {
        const i = parseFloat((n * step).toPrecision(10))
        if (i !== 0) {      // prevents creation of more than one 0 label
            let offset = 0.35
            if (i < 0)
                offset = 0.45

            coords.push(makeLabel(i + '', white, { x: -offset, y: i * sizeRatio - 0.4, z: 0 }, font))
        }
    }

    // z-axis labels
    for (let n = -(numLabels - 1); n < numLabels; n++) {
        const i = parseFloat((n * step).toPrecision(10))
        if (i !== 0) {      // prevents creation of more than one 0 label
            let offset = 0.35
            if (i < 0) {
                offset = 0.45
            }
            // we need to store the coord because we need to set it's rotation later.
            const coord = makeLabel(i + '', white, { x: -offset, y: 0, z: i * sizeRatio }, font) 
            coord.setRotationFromAxisAngle(
                new THREE.Vector3(1, 0, 0),
                Math.PI / 2
            )
            coords.push(coord)
        }
    }

    scene.add(...coords)
    return coords
}

export function disposeCoordinates(scene: THREE.Scene, coords: THREE.Mesh[]) {
    for (const coord of coords) {
        scene.remove(coord)
        coord.geometry.dispose();
        (coord.material as THREE.Material).dispose()
    }
}