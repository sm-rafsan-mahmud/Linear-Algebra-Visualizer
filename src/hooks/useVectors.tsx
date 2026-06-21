import * as THREE from 'three'
import type { Font } from 'three/addons/loaders/FontLoader.js'
import { usePgramSlot } from './usePgramSlot'
import { useVectorSlot } from './useVectorSlot'

export function useVectors({ sceneRef, REAL_GRID_SIZE, gridSizeRef, cachedFontRef } : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    REAL_GRID_SIZE: number,
    gridSizeRef: React.RefObject<number>
    cachedFontRef: React.RefObject<Font | null>
}) {
    const matrixVectors = useVectorSlot({ sceneRef, REAL_GRID_SIZE, gridSizeRef, cachedFontRef })
    const resultVectors = useVectorSlot({ sceneRef, REAL_GRID_SIZE, gridSizeRef, cachedFontRef })
    const resultPgrams  = usePgramSlot({ sceneRef, REAL_GRID_SIZE, gridSizeRef })

    return {
        setMatrixVector: matrixVectors.set,
        clearMatrixVector: matrixVectors.clear,
        setResultVector: resultVectors.set,
        clearResultVector: resultVectors.clear,
        setResultPgram: resultPgrams.set,
        clearResultPgram: resultPgrams.clear,
        redrawVectors: () => { matrixVectors.redraw(); resultVectors.redraw(); resultPgrams.redraw() },
        disposeVectors: () => { matrixVectors.disposeAll(); resultVectors.disposeAll(); resultPgrams.disposeAll() },
        setVectorLabelAngles: (camera: THREE.Camera) => { matrixVectors.setLabelAngles(camera); resultVectors.setLabelAngles(camera) },
    }
}