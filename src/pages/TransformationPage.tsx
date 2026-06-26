import { useEffect, useState } from "react";
import VBox from "../components/VBox";
import { useTransformationPage } from "../hooks/useTransformationPage";
import type { RowData, MatrixData, VectorData } from "../lib/types";
import * as math from "mathjs";
import MatrixParser from "../utils/MatrixParser";
import VectorParser from "../utils/VectorParser";
import NormalizeMatrix from "../utils/NormalizeMatrix";
import { matrix } from "mathjs";
import MatrixUI from "../components/MatrixUI";
import VectorUI from "../components/VectorUI";
import ChatBox from "../components/chatBox";

import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import { getDefaultColor } from "../lib/utilFunctions";

export function buildScope(matrices: MatrixData[], vectors: VectorData[]) {
  const scope: Record<string, math.Matrix> = {};

  matrices.forEach((mat) => {
    scope[mat.name] = matrix(MatrixParser(mat.values));
  });

  vectors.forEach((vec) => {
    scope[vec.name] = matrix([VectorParser(vec.values)]);
  });

  return scope;
}

export default function TransformationPage() {
  const {
    mountRef,
    setCameraPosition,
    CAM_3D,
    CAM_2D,
    setUserVector,
    clearUserVector
  } = useTransformationPage();
  const [rows, setRows] = useState<RowData[]>([{ id: 1, value: "" }]);

  const matrices = useMatrixStore((s) => s.matrices);
  const addMatrix = useMatrixStore((s) => s.addMatrix);

  const vectors = useVectorStore((s) => s.vectors);
  const addVector = useVectorStore((s) => s.addVector);

  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [nameID, setNameID] = useState("A");
  const [vectorName, setVectorName] = useState("a");

  const MAX_VECTOR_SLOTS = 20;

  useEffect(() => {
    // clear all slots to prevent stale renders.
    for (let i = 0; i < MAX_VECTOR_SLOTS; i++) {
      clearUserVector(i)
    }

    vectors.forEach((vec, i) => {
      const nums = vec.values.map((v) => parseFloat(v))
      const allValid = nums.length >= 2 && nums.length <= 3 && nums.every((n) => !isNaN(n))
      if (!allValid) return

      const x = nums[0]
      const y = nums[1]
      const z = nums[2] ?? 0

      setUserVector(i, x, y, z, vec.color, vec.name)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vectors])

  function addNewBox() {
    const maxId = rows.reduce((m, r) => (r.id > m ? r.id : m), 0);
    setRows([...rows, { id: maxId + 1, value: "" }]);
  }

  // const [resultColors, setResultColors] = useState<string[]>([])

  function handleAddMatrix() {
    addMatrix({ name: nameID, values: [[""]] });
    setNameID("");
  }

  function handleAddVector() {
    addVector({ name: vectorName, values: [""], color: getDefaultColor() });
    setVectorName("");
  }

  function recomputeAll(updatedRows = rows) {
    // updatedRows.forEach((row, i) => {
    //   if (!row.value.trim()) return;
    //   try {
    //     const scope = buildScope(matrices, vectors);
    //     const raw = math.evaluate(row.value, scope);
    //     const formatted = NormalizeMatrix(raw);
    //     // const vec = tryParseColumnVector(formatted);
    //     // if (vec) setResultVector(i, vec.x, vec.y, vec.z);
    //     // else clearResultVector(i);
    //   } catch {
    //     // clearResultVector(i);
    //   }
    // });
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
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
        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 0,
          }}
        >
          <h2 style={{ margin: 0 }}>Linear Algebra Visualizer</h2>

          <button onClick={addNewBox}>Add Formula Box</button>

          <VBox
            rows={rows}
            onRowCellChange={(rowIdx, value) => {
              const updated = rows.map((r, i) =>
                i === rowIdx ? { ...r, value } : r
              );
              setRows(updated);
              recomputeAll(updated);
            }}
          />

          {/* MATRICES */}
          <div style={{ marginTop: 8 }}>
            {matrices.map((m) => (
              <MatrixUI
                key={m.name}
                matrix={m}
                selectedName={selectedName}
                setSelectedName={setSelectedName}
              />
            ))}
          </div>

          {/* VECTORS */}
          <div>
            {vectors.map((v) => (
              <VectorUI
                key={v.name}
                vector={v}
                selectedName={selectedName}
                setSelectedName={setSelectedName}
              />
            ))}
          </div>

          {/* ADD MATRIX */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={nameID}
              onChange={(e) => setNameID(e.target.value)}
              placeholder="Matrix name"
              style={inputStyle}
            />
            <button onClick={handleAddMatrix}>Add Matrix</button>
          </div>

          {/* ADD VECTOR */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={vectorName}
              onChange={(e) => setVectorName(e.target.value)}
              placeholder="Vector name"
              style={inputStyle}
            />
            <button onClick={handleAddVector}>Add Vector</button>
          </div>
        </div>

        {/* ChatBox pinned to bottom */}
        <div
          style={{
            height: 320,
            flexShrink: 0,
            borderTop: "1px solid #1e293b",
          }}
        >
          <ChatBox />
        </div>
      </div>

      {/* RIGHT — Three.js canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            display: "flex",
            gap: 8,
          }}
        >
          <button onClick={() => setCameraPosition(CAM_3D)}>3D</button>
          <button onClick={() => setCameraPosition(CAM_2D)}>2D</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 4,
  color: "white",
  padding: "4px 8px",
};