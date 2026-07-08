import type { ShapesPageState } from "../../lib/types";

interface ShapeManagerProps {
  state: ShapesPageState,
  pointCount: number,
  onAdd: () => void,
  onCancel: () => void,
  onNew: () => void
}

export default function ShapeManager({ state, pointCount, onAdd, onCancel, onNew }: ShapeManagerProps) {
    
  const labelFromState = () => {
    if (state === 'idle') return 'Add Shape'
    if (state === 'placing') return pointCount < 3 ? 'Select Points' : 'Confirm Shape'
    if (state === 'transforming') return 'New Shape'
    return ''
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
      <button style={{ width: state === 'placing' ? "50%" : "100%" }} onClick={state !== 'transforming' ? onAdd : onNew}>{labelFromState()}</button>
      {state === 'placing' && <button style={{ width: "50%" }} onClick={onCancel}>Cancel</button>}
    </div>
  )
}