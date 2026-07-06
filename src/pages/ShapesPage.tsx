import AddShape from '../components/2d-shapes/AddShape'
import CancelShape from '../components/2d-shapes/CancelShape'
import TransformControls from '../components/2d-shapes/TransformControls'
import { useShapesPage } from '../hooks/2d-shapes/useShapesPage'
import type { Page } from '../lib/types'

interface ShapesPageProps {
  swapPage: (page: Page) => void
}

export default function ShapesPage({ swapPage }: ShapesPageProps) {
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
    <div style={{display: "flex", height: "100vh", width: "100wv"}}>
      {/* LEFT PANEL */}
      <div
        style={{
          width: "33%",
          display: "flex",
          flexDirection: "column",
          background: "#0f172a",
          color: "white",
          minHeight: 0,
        }}
      >
            
        {/* HEADER */}
        <div
          style={{
            overflowY: "auto",
            padding: 20,
            gap: 12,
            minHeight: 0
          }}
        >
          <h2 style={{margin: 0, padding: "8px 8px"}}>Transformations on Shapes</h2>
          <button onClick={() => swapPage('transformations')}>Vectors</button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 0
          }}
        >
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

      {/* CANVAS */}
      <div style={{flex: 1, position: "relative"}}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}