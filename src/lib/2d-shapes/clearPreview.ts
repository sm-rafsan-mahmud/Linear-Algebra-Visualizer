import * as THREE from 'three'

export function clearPreview(scene: THREE.Scene, dots: THREE.Mesh[], line: THREE.Line | null) {
    // remove dots
    dots.forEach(dot => {
        scene.remove(dot)
        dot.geometry.dispose()
    })
    dots = []

    // remove preview line
    if (line) {
        scene.remove(line)
        line.geometry.dispose()
        line = null
    }
}