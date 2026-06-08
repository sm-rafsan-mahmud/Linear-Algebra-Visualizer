import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from './makeLabel'
import type { AxisLabelsObject } from './types'

export async function createAxisLabels(
    scene: THREE.Scene,
    size: number,
    xColor: number,
    yColor: number,
    zColor: number
): Promise<AxisLabelsObject> {
    const loader = new FontLoader()
    const font = await loader.loadAsync(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
    )
    
    const xLbl = makeLabel('X', xColor, { x: size + 0.5, y: 0, z: 0 }, font)
    const yLbl = makeLabel('Y', yColor, { x: 0, y: size + 0.5, z: 0 }, font)
    const zLbl = makeLabel('Z', zColor, { x: 0, y: 0, z: size - 0.5 }, font)

    scene.add(xLbl, yLbl, zLbl)
    return { xLbl, yLbl, zLbl }
}

export function disposeAxisLabels(scene: THREE.Scene, labels: AxisLabelsObject) {
    const xLbl = labels.xLbl
    const yLbl = labels.yLbl
    const zLbl = labels!.zLbl

    scene.remove(xLbl, yLbl, zLbl)
    xLbl.geometry.dispose();
    (xLbl.material as THREE.Material).dispose()
    yLbl.geometry.dispose();
    (yLbl.material as THREE.Material).dispose()
    zLbl.geometry.dispose();
    (zLbl.material as THREE.Material).dispose()
}