import * as THREE from 'three'
import type { Point2D } from '../types'

export function updateShapeMesh(mesh: THREE.Mesh, points: Point2D[]) {
    // dispose the old geometry
    mesh.geometry.dispose()

    // rebuild from the new points
    const shape = new THREE.Shape()
    shape.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach(p => shape.lineTo(p.x, p.y))
    shape.closePath();

    mesh.geometry = new THREE.ShapeGeometry(shape);
}