import { useState, type ChangeEvent } from "react"
import VBox from "../components/VBox"
import { useTransformationPage } from "../hooks/useTransformationPage"
import type { RowData } from "../lib/types"
import * as math from "mathjs"
import MatrixParser from "../utils/MatrixParser"
import NormalizeMatrix from "../utils/NormalizeMatrix"
import { matrix } from "mathjs"
import MatrixUI from "../components/MatrixUI"
import formatExpressionName from "../utils/formatExpressionName"

type MatrixData = {
  nameID: string;
  values: string[][];
};

export function buildScope(matrices: MatrixData[]) {
  const scope: Record<string, math.Matrix> = {};
  matrices.forEach(mat => {
    scope[mat.nameID] = matrix(MatrixParser(mat.values));
  });
  return scope;
}

export default function TransformationPage() {
  const {
    mountRef,
    setCameraPosition,
    CAM_3D,
    CAM_2D,
    setMatrixVector,
    clearMatrixVector,
    setResultVector,
    clearResultVector,
    setResultPgram,
    clearResultPgram
  } = useTransformationPage();

  const [rows, setRows] = useState<RowData[]>([{ id: 1, value: "" }]);

  const addNewBox = () => {
    const maxId = rows.reduce((max, row) => (row.id > max ? row.id : max), 0);
    setRows([...rows, { id: maxId + 1, value: "" }]);
  };

  const [matrices, setMatrices] = useState<MatrixData[]>([]);
  const [nameID, setNameID] = useState("A");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<string[][]>([[""]]);
  const [resultMatrices, setResultMatrices] = useState<(MatrixData | null)[]>([]);

  function tryParseColumnVector(values: string[][]): { x: number; y: number; z: number } | null {
    // Must be a column matrix: every row has exactly 1 column
    if (!values.every(row => row.length === 1)) return null
    // Must be 2 or 3 rows
    if (values.length !== 2 && values.length !== 3) return null

    const nums = values.map(row => parseFloat(row[0]))
    if (nums.some(isNaN)) return null  // incomplete / non-numeric entry

    return {
        x: nums[0],
        y: nums[1],
        z: nums[2] ?? 0  // default z to 0 for 2D vectors
    }
  }

  // Returns { left, right, op } if the expression is a simple "X + Y" or "X - Y",
  // where left and right are matrix nameIDs. Returns null otherwise.
  function parseBinaryVectorOp(
    expr: string,
    matrices: MatrixData[]
  ): { left: string; right: string; op: '+' | '-' } | null {
    const nameIDs = new Set(matrices.map(m => m.nameID))

    // Match patterns like "A + B" or "A - B" (with optional whitespace)
    const match = expr.trim().match(/^([A-Za-z]\w*)\s*([+\-])\s*([A-Za-z]\w*)$/)
    if (!match) return null

    const [, left, op, right] = match
    if (!nameIDs.has(left) || !nameIDs.has(right)) return null

    return { left, right, op: op as '+' | '-' }
  }

  function handleAddMatrix() {
    const newMatrix: MatrixData = { nameID, values: [[""]] };
    setMatrices(m => {
      const updated = [...m, newMatrix];
      setSelectedIdx(updated.length - 1);
      setNameID("");
      return updated;
    });
  }

  function handleNameIDChange(e: ChangeEvent<HTMLInputElement>) {
    setNameID(e.target.value);
  }

  function handleAddRow() {
    if (selectedIdx === null) return;
    setMatrices(m => m.map((mat, i) =>
      i === selectedIdx
        ? { ...mat, values: [...mat.values, Array(mat.values[0]?.length || 1).fill("")] }
        : mat
    ));
  }

  function handleRemoveRow() {
    if (selectedIdx === null) return;
    setMatrices(m => m.map((mat, i) =>
      i === selectedIdx && mat.values.length > 1
        ? { ...mat, values: mat.values.slice(0, -1) }
        : mat
    ));
  }

  function handleAddCol() {
    if (selectedIdx === null) return;
    setMatrices(m => m.map((mat, i) =>
      i === selectedIdx
        ? { ...mat, values: mat.values.map(row => [...row, ""]) }
        : mat
    ));
  }

  function handleRemoveCol() {
    if (selectedIdx === null) return;
    setMatrices(m => m.map((mat, i) =>
      i === selectedIdx && mat.values[0]?.length > 1
        ? { ...mat, values: mat.values.map(row => row.slice(0, -1)) }
        : mat
    ));
  }

  function recomputeAll(updatedMatrices: MatrixData[], UpdatedRows = rows) {
    UpdatedRows.forEach((row, i) => {
      if (!row.value.trim()) {
        setResultMatrices(prev => {
          const next = [...prev];
          while (next.length <= i) next.push(null);
          next[i] = null;
          return next;
        });
      return;
      }
      try {
        const scope = buildScope(updatedMatrices);
        const raw = math.evaluate(row.value, scope);
        const formattedValues = NormalizeMatrix(raw);

        const vec = tryParseColumnVector(formattedValues)
        if (vec) {
          setResultVector(i, vec.x, vec.y, vec.z)

          // Check if this result came from a simple vector addition/subtraction
          const binOp = parseBinaryVectorOp(row.value, updatedMatrices)
          if (binOp) {
            const leftMat  = updatedMatrices.find(m => m.nameID === binOp.left)
            const rightMat = updatedMatrices.find(m => m.nameID === binOp.right)

            const leftVec  = leftMat  ? tryParseColumnVector(leftMat.values)  : null
            const rightVec = rightMat ? tryParseColumnVector(rightMat.values) : null

            if (leftVec && rightVec) {
              setResultPgram(i, leftVec, rightVec, vec)
            
            } else {
              clearResultPgram(i)
            }
          } else {
            clearResultPgram(i)
          }
        } else {
          clearResultVector(i)
          clearResultPgram(i)
        }

        setResultMatrices(prev => {
          const next = [...prev];
          while (next.length <= i) next.push(null);
          next[i] = { nameID: formatExpressionName(row.value), values: formattedValues };
          return next;
        });
      } catch {
        clearResultVector(i)
        setResultMatrices(prev => {
          const next = [...prev];
          while (next.length <= i) next.push(null);
          next[i] = null;
          return next;
        });
      }
      console.log("recomputeAll called", updatedMatrices, UpdatedRows);
      UpdatedRows.forEach((row, i)=>{
        console.log("Row: ", i, row.value);
      })
    });
  }

  function handleValueChange(targetIdx: number, row: number, col: number, newValue: string) {
    setMatrices(m => {
      const updated = m.map((mat, i) =>
        i === targetIdx
        ? { ...mat, values: mat.values.map((r, ri) =>
          r.map((val, ci) => (ri === row && ci === col ? newValue : val))
        )}
        : mat
      );

      // Check if the updated matrix is now a valid column vector
      const vec = tryParseColumnVector(updated[targetIdx].values)
      if (vec) {
        setMatrixVector(targetIdx, vec.x, vec.y, vec.z)
    
      } else {
        clearMatrixVector(targetIdx)
      }

      recomputeAll(updated);
      return updated;
    });
  }

  function handleDeleteMatrix() {
    if (selectedIdx === null) return;
    clearMatrixVector(selectedIdx)
    setMatrices(m => {
      const updated = m.filter((_, i) => i !== selectedIdx);
      recomputeAll(updated);
      return updated;
    });
    setSelectedIdx(null);
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "33%",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        gap: 12,
        background: "#0f172a",
        color: "white",
        overflowY: "auto",
      }}>

        <h2>Linear Algebra Visualizer</h2>

        <button
          onClick={addNewBox}
          style={{
            padding: "10px 15px",
            background: "#38bdf8",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            color: "#0f172a",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Add Formula Box
        </button>

        <VBox
          rows={rows}
          onRowCellChange={(rowIdx, value) => {
          const updatedRows = rows.map((r, i) => i === rowIdx? {...r, value} : r);
          setRows(updatedRows)
            recomputeAll(matrices, updatedRows);
          }}
        />

        {/* USER MATRICES */}
        <div style={{ marginTop: 20 }}>
          {matrices.map((m, i) => (
            <MatrixUI
              key={i}
              matrix={m}
              index={i}
              selectedIdx={selectedIdx}
              setSelectedIdx={setSelectedIdx}
              handleValueChange={handleValueChange}
            />
          ))}
        </div>

        {/* RESULT MATRICES */}
        <div>
          {resultMatrices.map((m, i) => {
            if (!m) return null;
            return (
              <MatrixUI
                key={"r" + i}
                matrix={m}
                index={i}
                selectedIdx={null}
                setSelectedIdx={() => {}}
                handleValueChange={() => {}}
              />
            );
          })}
        </div>

        {/* MATRIX CONTROLS */}
        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", marginTop: 12 }}>
            Matrix name:
            <input
              type="text"
              value={nameID}
              onChange={handleNameIDChange}
              style={{ marginLeft: 8 }}
            />
          </label>

          <p style={{ margin: "8px 0" }}>
            {matrices.length} matri{matrices.length === 1 ? "x" : "ces"} added
          </p>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleAddMatrix}>Add Matrix</button>
            <button onClick={handleDeleteMatrix}>Delete Matrix</button>
          </div>
        </div>

        {/* RESULT DISPLAY */}
        {result[0][0] !== "" && (
          <div style={{ marginTop: 16 }}>
            <strong style={{ fontSize: 13, color: "#94a3b8" }}>Result</strong>
            <div style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: 4,
              marginTop: 6,
              padding: "8px 12px",
              background: "#1e293b",
              borderRadius: 6,
              border: "1px solid #334155",
            }}>
              {result.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 8 }}>
                  {row.map((cell, ci) => (
                    <div key={ci} style={{
                      minWidth: 40,
                      textAlign: "center",
                      padding: "4px 8px",
                      background: "#0f172a",
                      borderRadius: 4,
                      fontSize: 14,
                      color: "#38bdf8",
                      fontFamily: "monospace",
                    }}>
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROW/COL CONTROLS */}
        <div style={{
          marginTop: "auto",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          paddingTop: 12,
        }}>
          <button onClick={handleAddRow}>+ Row</button>
          <button onClick={handleRemoveRow}>- Row</button>
          <button onClick={handleAddCol}>+ Col</button>
          <button onClick={handleRemoveCol}>- Col</button>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 8 }}>
          <button onClick={() => setCameraPosition(CAM_3D)}>3D</button>
          <button onClick={() => setCameraPosition(CAM_2D)}>2D</button>
          
        </div>
      </div>

    </div>
  );
}
