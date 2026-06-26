import * as THREE from 'three'
import { Font } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from './makeLabel'
import type { AxisLabelsObject } from './types'

export function createAxisLabels(
    scene: THREE.Scene,
    size: number,
    font: Font
): AxisLabelsObject {
    const red = 0xff0000
    const green = 0x00ff00
    const blue = 0x0000ff

    const xLbl = makeLabel('X', red, { x: size + 0.5, y: 0, z: 0 }, font)
    const yLbl = makeLabel('Y', green, { x: 0, y: size + 0.5, z: 0 }, font)
    const zLbl = makeLabel('Z', blue, { x: 0, y: 0, z: size - 0.5 }, font)

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