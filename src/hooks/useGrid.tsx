import * as THREE from 'three'
import { createGrid, disposeGrid } from '../lib/createGrid';
import { createAxes, disposeAxes } from '../lib/createAxes';
import { createAxisLabels, disposeAxisLabels } from '../lib/createAxisLabels';
import { createCoordinates, disposeCoordinates } from '../lib/createCoordinates';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import type { AxisLabelsObject, AxesObject } from '../lib/types';
import { useRef } from 'react';
import { useVectors } from './useVectors';
import type { Font } from 'three/addons/loaders/FontLoader.js'

export function useGrid({ sceneRef, axisLabelsRef, cachedFontRef } : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    axisLabelsRef: React.RefObject<AxisLabelsObject | null>,
    cachedFontRef: React.RefObject<Font | null>
}) {
    // grid variables
    const REAL_GRID_SIZE = 10
    const MINOR_GRID_COLOR = 0xaaaaaa
    const MAJOR_GRID_COLOR = 0xffffff
    const gridSizeRef    = useRef<number>(5)
    const gridStepRef    = useRef<number>(0.5)
    const majorStepRef   = useRef<number>(2)

    // grid objects (needed for cleanup)
    const axesRef      = useRef<AxesObject | null>(null)
    const gridRef      = useRef<LineSegments2 | null>(null)
    const majorGridRef = useRef<LineSegments2 | null>(null)
    const coordsRef    = useRef<THREE.Mesh[] | null>(null)

    const {
        redrawVectors,
        disposeVectors,
        setMatrixVector,
        clearMatrixVector,
        setResultVector,
        clearResultVector,
        setResultPgram,
        clearResultPgram,
        setLabelAngles
    } = useVectors({ sceneRef, realSize: REAL_GRID_SIZE, gridSizeRef, cachedFontRef })

    const drawAxes = (scene: THREE.Scene) => {
        axesRef.current = createAxes(scene, REAL_GRID_SIZE)
        axisLabelsRef.current = createAxisLabels(scene, 11, cachedFontRef.current!)
    }
    
    const drawGrid = (scene: THREE.Scene) => {
        gridRef.current = createGrid(scene, REAL_GRID_SIZE, gridSizeRef.current, gridStepRef.current, MINOR_GRID_COLOR)
        majorGridRef.current = createGrid(scene, REAL_GRID_SIZE, gridSizeRef.current, majorStepRef.current, MAJOR_GRID_COLOR)
        if (coordsRef.current) {
            disposeCoordinates(scene, coordsRef.current!)
        }
        initCoords(scene)
    }

    const disposeAllGridObjects = (scene: THREE.Scene) => {
        if (gridRef.current) { disposeGrid(scene, gridRef.current) }
        if (majorGridRef.current) { disposeGrid(scene, majorGridRef.current) }
        if (axesRef.current) { disposeAxes(scene, axesRef.current) }
        if (axisLabelsRef.current) {
            disposeAxisLabels(scene, axisLabelsRef.current)
        }
        if (coordsRef.current) { disposeCoordinates(scene, coordsRef.current) }
        disposeVectors()
    }

    const resizeGrid = (direction: 'out' | 'in', scene: THREE.Scene) => {
        // change the gridSize on scroll (not REAL_GRID_SIZE).
        const ZOOM_FACTOR = 1.1
        const MIN_SIZE = 1e-4
        const MAX_SIZE = 1e5

        const factor = direction === 'out' ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
        gridSizeRef.current = Math.max(MIN_SIZE, Math.min(MAX_SIZE, gridSizeRef.current * factor))

        rescaleGrid(direction, scene)
        redrawVectors()

        // dispose of and redraw the grid
        if (gridRef.current) { disposeGrid(scene, gridRef.current) }
        if (majorGridRef.current) { disposeGrid(scene, majorGridRef.current) }

        gridRef.current = createGrid(scene, REAL_GRID_SIZE, gridSizeRef.current, gridStepRef.current, 0xaaaaaa)
        majorGridRef.current = createGrid(scene, REAL_GRID_SIZE, gridSizeRef.current, majorStepRef.current, 0xffffff)
    }

    const rescaleGrid = (direction: 'out' | 'in', scene: THREE.Scene) => {
        const ratio = majorStepRef.current / gridSizeRef.current
        const tooSmall = ratio < 0.25
        const tooLarge = ratio > 0.75

        if (!tooSmall && !tooLarge) { 
            disposeCoordinates(scene, coordsRef.current!)
            initCoords(scene)   
            return
        }

        const magnitude = Math.pow(10, Math.floor(Math.log10(majorStepRef.current)))
        const criticalDigit = Math.round(majorStepRef.current / magnitude) // gives 1, 2, or 5
        
        const clean = (n: number) => parseFloat(n.toPrecision(1))

        if (direction === 'out') {
            switch (criticalDigit) {
                case 1:
                    majorStepRef.current = clean(2 * magnitude)
                    gridStepRef.current = majorStepRef.current / 4
                    break
                case 2:
                    majorStepRef.current = clean(5 * magnitude)
                    gridStepRef.current = majorStepRef.current / 5
                    break
                case 5:
                    majorStepRef.current = clean(10 * magnitude)     // e.g. 5 -> 10
                    gridStepRef.current = majorStepRef.current / 4
                    break
            }
        } else {
            switch (criticalDigit) {
                case 1:
                    majorStepRef.current = clean(0.5 * magnitude)    // e.g. 0.1 -> 0.05
                    gridStepRef.current = majorStepRef.current / 5
                    break
                case 2:
                    majorStepRef.current = clean(magnitude)
                    gridStepRef.current = majorStepRef.current / 4
                    break
                case 5:
                    majorStepRef.current = clean(2 * magnitude)
                    gridStepRef.current = majorStepRef.current / 4
                    break
            }
        }

        disposeCoordinates(scene, coordsRef.current!)
        initCoords(scene)
    }

    const initCoords = (scene: THREE.Scene) => {
        // define the number of coordinate labels
        let numLabels: number
        if (gridSizeRef.current % majorStepRef.current != 0) { // if the gridSize is not a multiple of the major grid step
            numLabels = Math.ceil(gridSizeRef.current / majorStepRef.current)
            // ex. if size = 5 & majStep = 2 we want 3 labels because that gives us
            // j = -2 * (3 - 1) = -4, which is the correct first label value and
            // j < 2 * 3 = 6, which means our largest label will be 4, which is correct 
        } else {
            numLabels = gridSizeRef.current / majorStepRef.current
            // ex. if size = 6 & step = 3, we want 3 labels (-4, -2, 0, 2, 4) because we don't want labels at the boundaries.
            // numLabels = 3 producing 5 labels is because numLabels refers to the number of labels in [0, size)
        }
        coordsRef.current = createCoordinates(
            scene,
            REAL_GRID_SIZE / gridSizeRef.current,
            majorStepRef.current,
            numLabels,
            cachedFontRef.current!
        )
    }
 
    return {
        drawAxes,
        drawGrid,
        disposeAllGridObjects,
        resizeGrid,
        setMatrixVector,
        clearMatrixVector,
        setResultVector,
        clearResultVector,
        setResultPgram,
        clearResultPgram,
        setLabelAngles
    }

}