import { useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableMatrixItem from '../components/2d-shapes/SortableMatrixItem'
import { useShapesPage } from '../hooks/2d-shapes/useShapesPage'
import type { Page, ShapesPageState, TransformationType, ApplyTransformButton } from '../lib/types'
import * as buildMatrix from '../lib/2d-shapes/buildMatrices'
import ShapeManager from '../components/2d-shapes/ShapeManager'

interface ShapesPageProps {
  swapPage: (page: Page) => void
}

export default function ShapesPage({ swapPage }: ShapesPageProps) {
  const {
    demoState,
    pointCount,
    handleTogglePlacing,
    handleCancelPlacing,
    addMatrix,
    reorderMatrices,
    applyTransformsToIndex,
    handleNewShape,
    matrices,
    handleMatrixEdit,
    applyError,
    mountRef
  } = useShapesPage()

  const [selectedMatrixName, setSelectedMatrixName] = useState<string | null>(null)
  const currTransformRef = useRef(0)
  const [currTransform, setCurrTransform] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }, // avoid hijacking clicks that select/edit a matrix
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = matrices.findIndex((m) => m.name === active.id)
    const newIndex = matrices.findIndex((m) => m.name === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    reorderMatrices(oldIndex, newIndex)
  }

  const handleApplyTransforms = (type: ApplyTransformButton) => {
    switch (type) {
      case 'Reset':
        currTransformRef.current = 0
        break
      case 'Prev':
        if (currTransformRef.current !== 0) currTransformRef.current--
        break
      case 'Next':
        if (currTransformRef.current < matrices.length) currTransformRef.current++
        break
      case 'All':
        currTransformRef.current = matrices.length
        break
    }

    setCurrTransform(currTransformRef.current)
    applyTransformsToIndex(currTransformRef.current)
  }

  const setTemplate = (name: string, type: TransformationType) => {
    switch (type) {
      case 'translation':
        handleMatrixEdit(name, buildMatrix.translation(1, 2))
        break
      case 'dilation':
        handleMatrixEdit(name, buildMatrix.dilation(2))
        break
      case 'rotation':
        handleMatrixEdit(name, buildMatrix.rotation(45))
        break
      case 'shear':
        handleMatrixEdit(name, buildMatrix.shear(2, 0))
        break
      case 'squeeze':
        handleMatrixEdit(name, buildMatrix.squeeze(2, 0.5))
        break
      case 'reflection':
        handleMatrixEdit(name, buildMatrix.reflection(true, false))
    }
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

        
        {/* CONTROLS */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <ShapeManager
            state={demoState as ShapesPageState} 
            pointCount={pointCount} 
            onAdd={handleTogglePlacing}
            onCancel={handleCancelPlacing}
            onNew={handleNewShape}  
          />
          <button style={{ width: "100%" }} onClick={() => addMatrix((matrices.length + 1) + '.', buildMatrix.identity(2))}>Add Transformation</button>
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={matrices.map((m) => m.name)} strategy={verticalListSortingStrategy}>
              {matrices.map((matrix) => (
                <SortableMatrixItem
                  key={matrix.name}
                  matrix={matrix}
                  onChange={handleMatrixEdit}
                  selectedName={selectedMatrixName}
                  setSelectedName={setSelectedMatrixName}
                  newTemplate={(type) => setTemplate(matrix.name, type)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {matrices.length > 0 && (
            <div>
              <button onClick={() => handleApplyTransforms('Reset')}>
                Reset Shape
              </button>
              <button onClick={() => handleApplyTransforms('Prev')}>
                Previous
              </button>
              <button onClick={() => handleApplyTransforms('Next')}>
                Next
              </button>
              <button onClick={() => handleApplyTransforms('All')}>
                Apply All
              </button>
              <p>Showing Transform {currTransform} of {matrices.length}</p>
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