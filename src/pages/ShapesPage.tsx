import { useState } from 'react'
import AddShape from '../components/2d-shapes/AddShape'
import CancelShape from '../components/2d-shapes/CancelShape'
import TransformControls from '../components/2d-shapes/TransformControls'
import TransformMatrixUI from '../components/2d-shapes/TransformMatrixUI'
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
    handleTransform,
    handleApplyMatrices,
    handleReset,
    handleNewShape,
    matrices,
    handleMatrixEdit,
    applyError,
    mountRef
  } = useShapesPage()

  const [selectedMatrixName, setSelectedMatrixName] = useState<string | null>(null)

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
          {/* DEFAULT CONTROLS -- TEMP. */}
          {demoState != 'transforming' && <AddShape onClick={handleTogglePlacing} label={labelFromState()} />}
          {demoState == 'placing' && <CancelShape onClick={handleCancelPlacing} />}
          {demoState == 'transforming' && <TransformControls 
            onTransform={handleTransform}
            onReset={handleReset}
            onNewShape={handleNewShape}
          />}

          {/* SHOW MATRIX */}
          {matrices.map((matrix) => (
            <TransformMatrixUI
              key={matrix.name}
              matrix={matrix}
              onChange={handleMatrixEdit}
              selectedName={selectedMatrixName}
              setSelectedName={setSelectedMatrixName}
            />
          ))}

          {matrices.length > 0 && (
            <div>
              <button onClick={handleApplyMatrices}>
                Apply Transforms
              </button>
              {applyError && (
                <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: 8 }}>
                  {applyError}
                </p>
              )}
            </div>
          )}

        </div>

      </div>

      {/* CANVAS */}
      <div style={{flex: 1, position: "relative"}}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}