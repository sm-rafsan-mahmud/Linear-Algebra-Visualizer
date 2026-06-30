import * as THREE from 'three'
import { Font } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from './utilFunctions'

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
        let offset = 0.0
        if (i < 0)
            offset = 0.1

        const label = makeLabel(i + '', white, { x: i * sizeRatio - offset, y: -0.4, z: 0.01 }, font, 0.3)
        
        label.geometry.computeBoundingBox()
        const box = label.geometry.boundingBox
        const width = box!.max.x - box!.min.x
        const height = box!.max.y - box!.min.y

        const bg = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.1, height + 0.08, 0.01),
            new THREE.MeshBasicMaterial({ color: 0x002233, transparent: true, opacity: 1.0 })
        )

        bg.position.copy(label.position)
        bg.position.z = label.position.z - 0.005
        scene.add(bg)

        coords.push(label, bg)
    }

    // y-axis labels
    for (let n = -(numLabels - 1); n < numLabels; n++) {
        const i = parseFloat((n * step).toPrecision(10))
        if (i !== 0) {      // prevents creation of more than one 0 label
            const numDigits = i.toString().length
            const xOffset = 0.25 + 0.1 * numDigits

            const label = makeLabel(i + '', white, { x: -xOffset, y: i * sizeRatio, z: 0.01 }, font, 0.3)

            label.geometry.computeBoundingBox()
            const box = label.geometry.boundingBox
            const width = box!.max.x - box!.min.x
            const height = box!.max.y - box!.min.y

            const bg = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.1, height + 0.08, 0.01),
                new THREE.MeshBasicMaterial({ color: 0x002233, transparent: true, opacity: 1.0 })
            )

            bg.position.copy(label.position)
            bg.position.z = label.position.z - 0.005
            scene.add(bg)

            coords.push(label, bg)
        }
    }

    // z-axis labels
    for (let n = -(numLabels - 1); n < numLabels; n++) {
        const i = parseFloat((n * step).toPrecision(10))
        if (i !== 0) {      // prevents creation of more than one 0 label
            const numDigits = i.toString().length
            const xOffset = 0.25 + 0.1 * numDigits

            const label = makeLabel(i + '', white, { x: -xOffset, y: 0, z: i * sizeRatio }, font, 0.3) 
            label.setRotationFromAxisAngle(
                new THREE.Vector3(1, 0, 0),
                Math.PI / 2
            )
            coords.push(label) // z-axis labels don't overlap grid & thus don't need backgrounds
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