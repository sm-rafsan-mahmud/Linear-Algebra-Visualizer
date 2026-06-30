import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import type { Point3D, PgramObject } from "../types";
import { getScaledPos, isChopped } from '../utilFunctions';

function chopAndScale(pos: Point3D, realSize: number, gridSize: number): Point3D {
    if (Math.abs(pos.x) > gridSize || Math.abs(pos.y) > gridSize || Math.abs(pos.z) > gridSize) {
        let t = Infinity
        if (pos.x !== 0) t = Math.min(t, gridSize / Math.abs(pos.x))
        if (pos.y !== 0) t = Math.min(t, gridSize / Math.abs(pos.y))
        if (pos.z !== 0) t = Math.min(t, gridSize / Math.abs(pos.z))

        return getScaledPos({ x: t * pos.x, y: t * pos.y, z: t * pos.z }, realSize, gridSize)
    }

    return getScaledPos(pos, realSize, gridSize)
}

export function createPgramVis(
    scene: THREE.Scene,
    u: Point3D,
    v: Point3D,
    sum: Point3D,
    color: number,
    realSize: number,
    size: number
): PgramObject {
    // chop vectors if needed and scale them to the size ratio
    const uPos   = chopAndScale(u, realSize, size)
    const vPos   = chopAndScale(v, realSize, size)
    const sumPos = chopAndScale(sum,   realSize, size)
    
    // check if vectors need to be chopped (alters rendering)
    const uChopped   = isChopped(u, size)
    const vChopped   = isChopped(v, size)
    const sumChopped = isChopped(sum, size)

    // only render line from u to u+v if neither are uChopped
    let uv: Line2 | null = null
    if (!uChopped && !sumChopped) {
        uv = new Line2(
            new LineGeometry().setPositions([
                uPos.x,   uPos.y,   uPos.z,
                sumPos.x, sumPos.y, sumPos.z
            ]),
            new LineMaterial({
                color,
                linewidth: 3,
                dashed: true,
                dashSize: 0.15,
                gapSize:  0.1,
                resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
            })
        )
        uv.computeLineDistances()
        scene.add(uv)
    }

    let vu: Line2 | null = null
    // only render line from v to u+v if neither are uChopped
    if (!vChopped && !sumChopped) {
        vu = new Line2(
            new LineGeometry().setPositions([
                vPos.x,   vPos.y,   vPos.z,
                sumPos.x, sumPos.y, sumPos.z
            ]),
            new LineMaterial({
                color,
                linewidth: 3,
                dashed: true,
                dashSize: 0.15,
                gapSize:  0.1,
                resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
            })
        )
        vu.computeLineDistances()
        scene.add(vu)
    }

    // render the parallelogram
    const pgramGeometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        0.0,      0.0,      0.0,      // 0: origin
        uPos.x,   uPos.y,   uPos.z,   // 1: u
        sumPos.x, sumPos.y, sumPos.z, // 2: u+v
        vPos.x,   vPos.y,   vPos.z    // 3: v
    ]);
    
    const indices = new Uint32Array([
        0, 1, 2,  // First triangle: origin -> u -> u+v
        0, 2, 3   // Second triangle: origin -> u+v -> v
    ]);

    pgramGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    pgramGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
    const pgramMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    const pgram = new THREE.Mesh(pgramGeometry, pgramMaterial)

    scene.add(pgram)

    return { uv, vu, pgram, color, sum, u, v }
}

export function disposePgramVis(scene: THREE.Scene, pgramVis: PgramObject) {
    scene.remove(pgramVis.pgram)
    pgramVis.pgram.geometry.dispose();
    (pgramVis.pgram.material as THREE.Material).dispose()

    if (pgramVis.uv) {
        scene.remove(pgramVis.uv)
        pgramVis.uv.geometry.dispose();
        (pgramVis.uv.material as THREE.Material).dispose()
    }

    if (pgramVis.vu) {
        scene.remove(pgramVis.vu)
        pgramVis.vu.geometry.dispose();
        (pgramVis.vu.material as THREE.Material).dispose()
    }
}