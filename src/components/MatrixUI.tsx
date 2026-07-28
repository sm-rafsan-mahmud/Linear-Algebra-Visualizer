import { useEffect } from "react";
import Matrix from "./Matrix";
import type { MatrixData } from "../lib/types";
import { useMatrixStore } from "../store/matrixStore";
import resizeMatrixValues from "../utils/ResizeMatrix";
import { analyzeMatrix } from "../utils/MatrixAnalysis";
import MatrixParser from "../utils/MatrixParser";

export default function MatrixUI({
  matrix,
  selectedName,
  setSelectedName,
}: {
  matrix: MatrixData;
  selectedName: string | null;
  setSelectedName: (name: string) => void;
}) {
  const updateMatrix = useMatrixStore((s) => s.updateMatrix);
  const updateMatrixAnalysis = useMatrixStore((s) => s.updateMatrixAnalysis);

  const rows = matrix.values.length;
  const cols = matrix.values[0]?.length ?? 0;

  useEffect(() => {
    if (matrix.analysis) return;

    updateMatrixAnalysis(
      matrix.name,
      analyzeMatrix(MatrixParser(matrix.values))
    );
  }, [matrix.analysis, matrix.name, matrix.values, updateMatrixAnalysis]);

  function handleValueChange(row: number, col: number, val: string) {
    const newValues = matrix.values.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
    );
    const analysis = analyzeMatrix(MatrixParser(newValues));
    updateMatrix(matrix.name, newValues);
    updateMatrixAnalysis(matrix.name, analysis);
  }

  function handleResize(deltaRows: number, deltaCols: number) {
  const newRows = Math.max(1, rows + deltaRows);
  const newCols = Math.max(1, cols + deltaCols);

  if (newRows === rows && newCols === cols) return;

  const newValues = resizeMatrixValues(
    matrix.values,
    newRows,
    newCols
  );

  updateMatrix(matrix.name, newValues);

  updateMatrixAnalysis(
    matrix.name,
    analyzeMatrix(MatrixParser(newValues))
  );
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>

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
      </div>

      <Matrix
        values={matrix.values}
        setValues={handleValueChange}
        onResize={handleResize}
      />
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