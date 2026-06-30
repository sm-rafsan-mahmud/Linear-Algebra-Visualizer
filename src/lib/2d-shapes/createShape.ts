import * as THREE from 'three';
import type { Point2D } from '../types';

export function createShape(
    scene: THREE.Scene,
    points: Point2D[],
    color: number = 0x00ff00,
    opacity: number = 0.5
): THREE.Mesh {
    // outline the shape edges
    const shape = new THREE.Shape()
    shape.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach(pt => shape.lineTo(pt.x, pt.y))

    // render the shape
    const geometry = new THREE.ShapeGeometry(shape)
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}