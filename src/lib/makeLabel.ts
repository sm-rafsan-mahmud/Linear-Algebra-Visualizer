import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import type { Point3D } from "./types";
import type { Font } from 'three/examples/jsm/Addons.js';

export function makeLabel(
    text: string,
    color: number,
    pos: Point3D,
    font: Font
) {
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
    
    mesh.position.set(pos.x, pos.y, pos.z)
    return mesh
}