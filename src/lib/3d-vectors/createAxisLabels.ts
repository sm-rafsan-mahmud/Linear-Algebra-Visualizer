import * as THREE from 'three'
import { Font } from 'three/addons/loaders/FontLoader.js'
import { makeLabel } from '../utilFunctions'
import type { AxisLabelsObject } from '../types'

export function createAxisLabels(
    scene: THREE.Scene,
    size: number,
    font: Font
): AxisLabelsObject {
    const white = 0xffffff

    const xLbl = makeLabel('X', white, { x: size + 0.5, y: 0, z: 0 }, font, 0.4)
    const yLbl = makeLabel('Y', white, { x: 0, y: size + 0.5, z: 0 }, font, 0.4)
    const zLbl = makeLabel('Z', white, { x: 0, y: 0, z: size + 0.5 }, font, 0.4)

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