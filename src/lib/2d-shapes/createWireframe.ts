import * as THREE from 'three'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import type { Point2D } from '../types'

export function createWireframe(
    scene: THREE.Scene,
    points: Point2D[]
): LineSegments2 {
    // trace the set of points to create the wireframe
    const framePoints: number[] = []
    
    for (let i = 0; i < points.length; i++) {
        if (i != points.length - 1)
            framePoints.push(points[i].x, points[i].y, 0, points[i+1].x, points[i+1].y, 0)
        else
            framePoints.push(points[i].x, points[i].y, 0, points[0].x, points[0].y, 0)
    }

    const frameGeometry = new LineSegmentsGeometry()
    frameGeometry.setPositions(framePoints)

    const frameMaterial = new LineMaterial({
        color: 0xff0000,
        linewidth: 2,
        dashed: true,
        dashSize: 0.15,
        gapSize: 0.1,
    })
    
    const frame = new LineSegments2(frameGeometry, frameMaterial)
    frame.computeLineDistances()

    scene.add(frame)

    return frame
}