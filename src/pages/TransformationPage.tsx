import { useState, useEffect } from "react";
import MatrixGrid from "../components/MatrixGrid";
import VBox from "../components/VBox";
import { useTransformations } from "../hooks/useTransformationPage";
import type { RowData, Page } from "../lib/types";

interface TransformationPageProps {
  onNavigate: (page: Page) => void;
}

export default function TransformationPage({ onNavigate }: TransformationPageProps) {
  // TEXT ROWS (VBox)
  // -------------------------
  
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, value: "" },
  ]);
  const addRow = () => {
    const maxId = rows.reduce((max, row) => (row.id > max ? row.id : max), 0);
    const nextId = maxId + 1;
    setRows([...rows, { id: nextId, value: "" }]);
  };

  // -------------------------
  // MATRIX STATE
  // -------------------------
  const [matrix, setMatrix] = useState<string[][]>([
    ["0", "0"],
    ["0", "0"],
  ]);

  const {
    mountRef,
    setCameraPosition,
    CAM_3D,
    CAM_2D,
  } = useTransformations();

  // -------------------------
  // MATRIX CONTROLS
  // -------------------------
  const addMatrixRow = () => {
    const cols = matrix[0]?.length || 1;
    setMatrix((prev) => [
      ...prev,
      Array.from({ length: cols }, () => ""),
    ]);
  };

  const addMatrixCol = () => {
    setMatrix((prev) =>
      prev.map((row) => [...row, ""])
    );
  };

  const removeMatrixRow = () => {
    setMatrix((prev) => prev.slice(0, -1));
  };

  const removeMatrixCol = () => {
    setMatrix((prev) =>
      prev.map((row) => row.slice(0, -1))
    );
  };

  // -------------------------
  // DEBUG
  // -------------------------
  useEffect(() => {
    console.log("Matrix updated:", matrix);
  }, [matrix]);

  // -------------------------
  // UI
  // -------------------------
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
        color: "white"
      }}>

        <h2>Linear Algebra Visualizer</h2>

        <button
          onClick={addRow}
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
          Add Row
        </button>
        {/* VBox (optional existing system) */}
        <VBox
          rows={rows}
          onRowCellChange={(id, val) =>
            setRows((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, value: val } : r
              )
            )
          }
        />

        {/* MATRIX GRID */}
        <div style={{ marginTop: 20 }}>
          <h3>Matrix</h3>

          <MatrixGrid
            values={matrix}
            setValues={setMatrix}
          />
        </div>

        {/* MATRIX CONTROLS */}
        <div style={{
          marginTop: "auto",
          display: "flex",
          gap: 8,
          flexWrap: "wrap"
        }}>
          <button onClick={addMatrixRow}>+ Row</button>
          <button onClick={removeMatrixRow}>- Row</button>
          <button onClick={addMatrixCol}>+ Col</button>
          <button onClick={removeMatrixCol}>- Col</button>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

        <div style={{
          position: "absolute",
          top: 20,
          left: 20,
          display: "flex",
          gap: 8
        }}>
          <button onClick={() => setCameraPosition(CAM_3D)}>3D</button>
          <button onClick={() => setCameraPosition(CAM_2D)}>2D</button>
        </div>
      </div>

    </div>
  );
}