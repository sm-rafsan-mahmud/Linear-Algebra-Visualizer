import * as THREE from 'three'
import { createGrid, disposeGrid } from '../lib/createGrid';
import { createAxes, disposeAxes } from '../lib/createAxes';
import { createAxisLabels, disposeAxisLabels } from '../lib/createAxisLabels';
import { createCoordinates, disposeCoordinates } from '../lib/createCoordinates';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import type { AxisLabelsObject, AxesObject } from '../lib/types';
import { useRef } from 'react';
import { useVectors } from './useVectors';

export function useGrid({ sceneRef, axisLabelsRef, isMountedRef } : {
    sceneRef: React.RefObject<THREE.Scene | null>,
    axisLabelsRef: React.RefObject<AxisLabelsObject | null>,
    isMountedRef: React.RefObject<boolean>
}) {
    // grid variables
    const REAL_GRID_SIZE = 10;
    const gridSizeRef    = useRef<number>(5)
    const gridStepRef    = useRef<number>(0.5)
    const majorStepRef   = useRef<number>(2)

    // grid objects (needed for cleanup)
    const axesRef      = useRef<AxesObject | null>(null)
    const gridRef      = useRef<LineSegments2 | null>(null)
    const majorGridRef = useRef<LineSegments2 | null>(null)
    const coordsRef    = useRef<THREE.Mesh[] | null>(null)

    const {
        newVector,
        applyScalarMultiply,
        applyVectorAdd,
        redrawVectors,
        disposeVectors
    } = useVectors({ sceneRef, realSize: REAL_GRID_SIZE, gridSizeRef })

    const drawAxes = () => {
        axesRef.current = createAxes(sceneRef.current!, REAL_GRID_SIZE, 0xff0000, 0x00ff00, 0x0000ff)
        initLabels(isMountedRef)
    }
    
    const drawGrid = () => {
        gridRef.current = createGrid(sceneRef.current!, REAL_GRID_SIZE, gridSizeRef.current, gridStepRef.current, 0xaaaaaa)
        majorGridRef.current = createGrid(sceneRef.current!, REAL_GRID_SIZE, gridSizeRef.current, majorStepRef.current, 0xffffff)
        if (coordsRef.current) {
            disposeCoordinates(sceneRef.current!, coordsRef.current!)
        }
        initCoords(isMountedRef)
    }

    const disposeAllGridObjects = () => {
        if (gridRef.current) { disposeGrid(sceneRef.current!, gridRef.current) }
        if (majorGridRef.current) { disposeGrid(sceneRef.current!, majorGridRef.current) }
        if (axesRef.current) { disposeAxes(sceneRef.current!, axesRef.current) }
        if (axisLabelsRef.current) {
            disposeAxisLabels(sceneRef.current!, axisLabelsRef.current)
        }
        if (coordsRef.current) { disposeCoordinates(sceneRef.current!, coordsRef.current) }
        disposeVectors()
    }

    const resizeGrid = (direction: 'out' | 'in') => {
        // change the gridSize on scroll (not REAL_GRID_SIZE).
        const ZOOM_FACTOR = 1.1
        const MIN_SIZE = 1e-4
        const MAX_SIZE = 1e5

        const factor = direction === 'out' ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
        gridSizeRef.current = Math.max(MIN_SIZE, Math.min(MAX_SIZE, gridSizeRef.current * factor))

        rescaleGrid(direction)
        redrawVectors()

        // dispose of and redraw the grid
        if (gridRef.current) { disposeGrid(sceneRef.current!, gridRef.current) }
        if (majorGridRef.current) { disposeGrid(sceneRef.current!, majorGridRef.current) }

        gridRef.current = createGrid(sceneRef.current!, REAL_GRID_SIZE, gridSizeRef.current, gridStepRef.current, 0xaaaaaa)
        majorGridRef.current = createGrid(sceneRef.current!, REAL_GRID_SIZE, gridSizeRef.current, majorStepRef.current, 0xffffff)
    }

    const rescaleGrid = (direction: 'out' | 'in') => {
        const ratio = majorStepRef.current / gridSizeRef.current
        const tooSmall = ratio < 0.25
        const tooLarge = ratio > 0.75

        if (!tooSmall && !tooLarge) { 
            disposeCoordinates(sceneRef.current!, coordsRef.current!)
            initCoords(isMountedRef)   
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

        disposeCoordinates(sceneRef.current!, coordsRef.current!)
        initCoords(isMountedRef)
    }

        // const magnitude = Math.pow(10, Math.floor(Math.log10(gridSizeRef.current)))
        // const normalized = gridSizeRef.current / magnitude  // in range [1, 10)

        // let multiplier: number
        // if (normalized < 2)      multiplier = 1
        // else if (normalized < 5) multiplier = 2
        // else                     multiplier = 5

        // const newMajorStep = magnitude >= 1
        //     ? Math.round(multiplier * magnitude)
        //     : multiplier / Math.round(1 / magnitude)

        // const newMinorStep = multiplier === 5
        //     ? newMajorStep / 5
        //     : newMajorStep / 4

        // majorStepRef.current = newMajorStep
        // gridStepRef.current = newMinorStep

    async function initLabels(isMountedRef: { current: boolean }) {
        const scene = sceneRef.current!
        const labels = await createAxisLabels(scene, 11, 0xff0000, 0x00ff00, 0x0000ff)
    
        if (!isMountedRef.current || sceneRef.current !== scene) {
            disposeAxisLabels(scene, labels)
            return
        }
    
        axisLabelsRef.current = labels
    }

    async function initCoords(isMountedRef: { current: boolean }) {
        const scene = sceneRef.current!
        
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
            // numLabels = 3 producing 5 labels is explained by looking at ../lib/createCoordinates.ts
        }
        const coords = await createCoordinates(scene, REAL_GRID_SIZE / gridSizeRef.current, majorStepRef.current, numLabels, 0xffffff)

        if (!isMountedRef.current || sceneRef.current !== scene) {
            disposeCoordinates(scene, coords)
            return
        }

        coordsRef.current = coords
    }
 
    return {
        drawAxes,
        drawGrid,
        disposeAllGridObjects,
        resizeGrid,
        newVector,
        applyScalarMultiply,
        applyVectorAdd
    }

}