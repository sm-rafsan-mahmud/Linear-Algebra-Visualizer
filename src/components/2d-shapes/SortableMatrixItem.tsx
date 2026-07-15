import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TransformMatrixUI from './TransformMatrixUI'
import type { MatrixData, TransformationType } from '../../lib/types'

interface SortableMatrixItemProps {
  matrix: MatrixData
  onChange: (name: string, values: string[][]) => void
  selectedName: string | null
  setSelectedName: (name: string) => void
  newTemplate: (type: TransformationType) => void
}

export default function SortableMatrixItem({ matrix, ...rest }: SortableMatrixItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: matrix.name })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        style={{
          cursor: 'grab',
          padding: '4px 6px',
          color: '#64748b',
          touchAction: 'none', // required so dragging works on touch devices
          userSelect: 'none',
        }}
      >
        ⠿
      </div>
      <div style={{ flex: 1 }}>
        <TransformMatrixUI matrix={matrix} {...rest} />
      </div>
    </div>
  )
}