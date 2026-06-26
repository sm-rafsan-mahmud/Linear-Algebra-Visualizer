import * as THREE from 'three'
import type { Font } from 'three/addons/loaders/FontLoader.js'
import { usePgramSlot } from './usePgramSlot'
import { useVectorSlot } from './useVectorSlot'

export function useVectors({ REAL_GRID_SIZE, gridSizeRef, cachedFontRef } : {
    REAL_GRID_SIZE: number,
    gridSizeRef: React.RefObject<number>
    cachedFontRef: React.RefObject<Font | null>
}) {
    const matrixVectors = useVectorSlot({ REAL_GRID_SIZE, gridSizeRef, cachedFontRef })
    const resultVectors = useVectorSlot({ REAL_GRID_SIZE, gridSizeRef, cachedFontRef })
    const resultPgrams  = usePgramSlot({ REAL_GRID_SIZE, gridSizeRef })

    const redrawVectors = (scene: THREE.Scene) => {
        matrixVectors.redraw(scene)
        resultVectors.redraw(scene)
        resultPgrams.redraw(scene)
    }

    const disposeVectors = (scene: THREE.Scene) => {
        matrixVectors.disposeAll(scene)
        resultVectors.disposeAll(scene)
        resultPgrams.disposeAll(scene)
    }

    const setVectorLabelAngles = (camera: THREE.Camera) => {
        matrixVectors.setLabelAngles(camera)
        resultVectors.setLabelAngles(camera)
    }

    return {
        setMatrixVector: matrixVectors.set,
        clearMatrixVector: matrixVectors.clear,
        setResultVector: resultVectors.set,
        clearResultVector: resultVectors.clear,
        setResultPgram: resultPgrams.set,
        clearResultPgram: resultPgrams.clear,
        redrawVectors,
        disposeVectors,
        setVectorLabelAngles
    }
}