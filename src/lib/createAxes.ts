import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'


export function createAxes(
    scene: THREE.Scene,
    size: number,
    xColor: number,
    yColor: number,
    zColor: number,
    linewidth: number = 3
): { xAxis: Line2, yAxis: Line2, zAxis: Line2 } {
    function makeLine(points: [number, number, number, number, number, number], color: number): Line2 {
        const geometry = new LineGeometry()
        geometry.setPositions(points)
 
        const material = new LineMaterial({
            color,
            linewidth,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })
 
        return new Line2(geometry, material)
    }
 
    const xAxis = makeLine([-size, 0, 0, size, 0, 0], xColor)
    const yAxis = makeLine([0, -size, 0, 0, size, 0], yColor)
    const zAxis = makeLine([0, 0, -size + 1, 0, 0, size - 1], zColor)
 
    scene.add(xAxis, yAxis, zAxis)
    return {xAxis, yAxis, zAxis}
}