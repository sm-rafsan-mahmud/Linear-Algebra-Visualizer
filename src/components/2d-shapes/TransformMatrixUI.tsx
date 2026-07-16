import TransformMatrix from "./TransformMatrix";
import type { TransformationMatrixData, TransformationType } from "../../lib/types";
import resizeMatrixValues from "../../utils/ResizeMatrix";
import SelectTemplate from "./SelectTemplate";
import ColorPicker from "../ColorPicker";
import { getDefaultColor } from "../../lib/utilFunctions";

interface TransformMatrixUIProps {
  matrix: TransformationMatrixData
  onChange: (name: string, values: string[][]) => void
  selectedName: string | null
  setSelectedName: (name: string) => void
  newTemplate: (type: TransformationType) => void
  onDelete: () => void
  onChangeColor: (color: string) => void
}

export default function TransformMatrixUI({
  matrix,
  onChange,
  selectedName,
  setSelectedName,
  newTemplate,
  onDelete,
  onChangeColor
}: TransformMatrixUIProps) {
  const rows = matrix.values.length;
  const cols = matrix.values[0]?.length ?? 0;

  function handleValueChange(row: number, col: number, val: string) {
    const newValues = matrix.values.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
    );
    onChange(matrix.name, newValues);
  }

  function handleResize(deltaRows: number, deltaCols: number) {
    const newRows = Math.max(1, rows + deltaRows);
    const newCols = Math.max(1, cols + deltaCols);
    if (newRows === rows && newCols === cols) return;
    onChange(matrix.name, resizeMatrixValues(matrix.values, newRows, newCols));
  }

  return (
    <div
      onClick={() => setSelectedName(matrix.name)}
      style={{
        outline: selectedName === matrix.name ? "2px solid #38bdf8" : "none",
        padding: 8,
        marginBottom: 12,
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {/* Header row */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <strong>{matrix.name}</strong>

        <SelectTemplate onSelect={newTemplate}/>

        <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
          {/* Row controls */}
          <span style={labelStyle}>Rows</span>
          <button style={btnStyle} onClick={() => handleResize(-1, 0)}>−</button>
          <span style={countStyle}>{rows}</span>
          <button style={btnStyle} onClick={() => handleResize(1, 0)}>+</button>

          <span style={{ ...labelStyle, marginLeft: 8 }}>Cols</span>
          <button style={btnStyle} onClick={() => handleResize(0, -1)}>−</button>
          <span style={countStyle}>{cols}</span>
          <button style={btnStyle} onClick={() => handleResize(0, 1)}>+</button>
        </div>

        {/* Delete button — top right corner */}
        <button
          onClick={onDelete}
          title="Delete"
          style={{
            marginLeft: 6,
            width: 18,
            height: 18,
            padding: 0,
            background: "transparent",
            border: "none",
            color: "#334155",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: "18px",
            textAlign: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = "#ef4444"}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = "#aaaaaa"}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <TransformMatrix
          values={matrix.values}
          setValues={handleValueChange}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ColorPicker
            value={matrix.color ? matrix.color : getDefaultColor()}
            onChange={onChangeColor}
          />
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  padding: 0,
  lineHeight: "18px",
  textAlign: "center",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 3,
  color: "#94a3b8",
  cursor: "pointer",
  fontSize: 14,
};

const countStyle: React.CSSProperties = {
  minWidth: 14,
  textAlign: "center",
  fontSize: 12,
  color: "#e2e8f0",
  lineHeight: "20px",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#64748b",
  lineHeight: "20px",
};