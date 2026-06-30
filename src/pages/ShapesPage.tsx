'use client'
import AddShape from '../components/2d-shapes/AddShape'
import CancelShape from '../components/2d-shapes/CancelShape'
import TransformControls from '../components/2d-shapes/TransformControls'
import { useShapesPage } from '../hooks/2d-shapes/useShapesPage'

export default function ShapesPage() {
    const {
        demoState,
        pointCount,
        handleTogglePlacing,
        handleCancelPlacing,
        handleTranslate,
        handleDilate,
        handleRotate,
        handleReflect,
        handleReset,
        handleNewShape,
        mountRef
    } = useShapesPage()

    
    const labelFromState = () => {
        if (demoState === 'idle') return 'Add Shape'
        if (demoState === 'placing') return pointCount < 3 ? 'Select Points' : 'Confirm Shape'
        return ''
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden items-center">
            <div ref={mountRef} className="w-full h-full"/>

            <div className="absolute top-2 left-3 space-x-2">
                {demoState != 'transforming' && <AddShape onClick={handleTogglePlacing} label={labelFromState()} />}
                {demoState == 'placing' && <CancelShape onClick={handleCancelPlacing} />}
                {demoState == 'transforming' && <TransformControls 
                    onTranslate={handleTranslate}
                    onDilate={handleDilate}
                    onRotate={handleRotate}
                    onReflect={handleReflect}
                    onReset={handleReset}
                    onNewShape={handleNewShape}
                />}
            </div>
        </div>
    )
}