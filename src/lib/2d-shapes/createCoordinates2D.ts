import * as THREE from 'three'
import { Font } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from '../utilFunctions'

export function createCoordinates2D(
    scene: THREE.Scene,
    size: number,
    step: number,
    font: Font
): THREE.Mesh[] {
    const coords: THREE.Mesh[] = []
    const white = 0xffffff
    const bgColor = 0x002233
    
    // origin label (only need 1 & needs a different position)
    coords.push(makeLabel('0', white, { x: -0.4, y: -0.4, z: 0.01}, font, 0.35))

    const highestLabel = Math.floor(size / step) * step
    console.log(size, step, highestLabel)

    // x-axis labels
    for (let n = -highestLabel; n <= highestLabel; n += step) {
        console.log(n)
        const i = parseFloat((n).toPrecision(10))
        if (i !== 0) {
            let offset = 0.0
            if (i < 0) offset = 0.1

            const label = makeLabel(i + '', white, { x: i - offset, y: -0.4, z: 0.01 }, font, 0.35)
            
            label.geometry.computeBoundingBox()
            const box = label.geometry.boundingBox
            const width = box!.max.x - box!.min.x
            const height = box!.max.y - box!.min.y

            const bg = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.1, height + 0.08, 0.01),
                new THREE.MeshBasicMaterial({ color: bgColor })
            )

            bg.position.copy(label.position)
            bg.position.z = label.position.z - 0.005
            scene.add(bg)

            coords.push(label, bg)
        }
    }

    // y-axis labels
    for (let n = -highestLabel; n <= highestLabel; n += step) {
        const i = parseFloat((n).toPrecision(10))
        if (i !== 0) {      // prevents creation of more than one 0 label
            const numDigits = i.toString().length
            const xOffset = 0.25 + 0.1 * numDigits

            const label = makeLabel(i + '', white, { x: -xOffset, y: i, z: 0.01 }, font, 0.35)

            label.geometry.computeBoundingBox()
            const box = label.geometry.boundingBox
            const width = box!.max.x - box!.min.x
            const height = box!.max.y - box!.min.y

            const bg = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.1, height + 0.08, 0.01),
                new THREE.MeshBasicMaterial({ color: 0x002233 })
            )

            bg.position.copy(label.position)
            bg.position.z = label.position.z - 0.005
            scene.add(bg)

            coords.push(label, bg)
        }
    }

    scene.add(...coords)
    return coords
}

export function disposeCoordinates2D(scene: THREE.Scene, coords: THREE.Mesh[]) {
    for (const coord of coords) {
        scene.remove(coord)
        coord.geometry.dispose();
        (coord.material as THREE.Material).dispose()
    }
}