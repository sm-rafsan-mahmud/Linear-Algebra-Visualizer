import { useEffect } from "react";
import FormulaBox from "../components/FormulaBox";
import { useTransformationPage } from "../hooks/useTransformationPage";
import type { MatrixData, VectorData } from "../lib/types";
import * as math from "mathjs";
import MatrixParser from "../utils/MatrixParser";
import VectorParser from "../utils/VectorParser";
import NormalizeMatrix from "../utils/NormalizeMatrix";
import { matrix } from "mathjs";

import ChatBox from "../components/chatBox";
import { parseFormula } from "../utils/parsedFormula";
import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import { useFormulaStore } from "../store/FormulaStore";
import { getDefaultColor } from "../lib/utilFunctions";

function buildScope(matrices: MatrixData[], vectors: VectorData[]) {
  const scope: Record<string, math.Matrix> = {};

  matrices.forEach((mat) => {
    scope[mat.name] = matrix(MatrixParser(mat.values));
  });

  vectors.forEach((vec) => {
    scope[vec.name] = matrix(VectorParser(vec.values).map((v) => [v]));
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
    clearUserVector,
  } = useTransformationPage();

  const formulas = useFormulaStore((s) => s.formulas);
  const addFormula = useFormulaStore((s) => s.addFormula);
  const removeFormula = useFormulaStore((s) => s.removeFormula);
  const setFormulas = useFormulaStore((s) => s.setFormulas);

  const matrices = useMatrixStore((s) => s.matrices);
  // const addMatrix = useMatrixStore((s) => s.addMatrix);
  const removeMatrix = useMatrixStore((s) => s.removeMatrix);

  const vectors = useVectorStore((s) => s.vectors);
  const addVector = useVectorStore((s) => s.addVector);
  const updateVector = useVectorStore((s) => s.updateVector);
  const removeVector = useVectorStore((s) => s.removeVector);

  useEffect(() => {
    recomputeAll(formulas);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulas, matrices, vectors]);

  // Sync user vectors → Three.js (skip result vectors)
  useEffect(() => {
    const resultNames = new Set(
      formulas
        .map((f) => parseFormula(f.value))
        .filter((p) => p.kind === "compute")
        .map((p) => (p as { kind: "compute"; lhs: string }).lhs.trim())
    );

    const userVectors = vectors.filter((v) => !resultNames.has(v.name));

    userVectors.forEach((vec, i) => {
      const nums = VectorParser(vec.values);
      if (nums.length < 2 || nums.length > 3 || nums.some(isNaN)) {
        clearUserVector(i);
        return;
      }
      setUserVector(i, nums[0], nums[1], nums[2] ?? 0, vec.color, vec.name);
    });

    for (let i = userVectors.length; i < 20; i++) {
      clearUserVector(i);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vectors, formulas]);

  function tryParseColumnVector(values: string[][]) {
    if (!values.every((r) => r.length === 1)) return null;
    if (values.length !== 2 && values.length !== 3) return null;
    const nums = values.map((r) => parseFloat(r[0]));
    if (nums.some(isNaN)) return null;
    return { x: nums[0], y: nums[1], z: nums[2] ?? 0 };
  }

  // Used by FormulaRow to show inline result
  function computeResult(lhs: string): string[] | null {
    try {
      const scope = buildScope(matrices, vectors);
      const raw = math.evaluate(lhs, scope);

      if (typeof raw === "number") {
        return [String(Math.round(raw * 10000) / 10000)];
      }

      const formatted = NormalizeMatrix(raw);
      const vec = tryParseColumnVector(formatted);
      if (vec) {
        return [
          String(vec.x),
          String(vec.y),
          ...(vec.z !== 0 ? [String(vec.z)] : []),
        ];
      }
      return null;
    } catch {
      return null;
    }
  }

  // Syncs formula box results → Three.js + vector store
  function recomputeAll(updatedFormulas = formulas) {
    updatedFormulas.forEach((formula, i) => {
      const parsed = parseFormula(formula.value);

      const exprToEval =
        parsed.kind === "compute"
          ? parsed.lhs
          : parsed.kind === "plain" && formula.value.trim()
          ? formula.value.trim()
          : null;

      if (!exprToEval) {
        clearUserVector(i);
        return;
      }

      try {
        const scope = buildScope(matrices, vectors);
        const raw = math.evaluate(exprToEval, scope);
        const formatted = NormalizeMatrix(raw);
        const vec = tryParseColumnVector(formatted);

        if (vec) {
          const resultName = exprToEval.trim();
          const existing = vectors.find((v) => v.name === resultName);
          const color = existing ? existing.color : getDefaultColor();

          setUserVector(i, vec.x, vec.y, vec.z, color, exprToEval);

          const resultValues = [
            String(vec.x),
            String(vec.y),
            ...(vec.z !== 0 ? [String(vec.z)] : []),
          ];

          if (existing) updateVector(resultName, resultValues);
          else addVector({ name: resultName, values: resultValues, color });
        } else {
          clearUserVector(i);
        }
      } catch {
        clearUserVector(i)
      }
    });
  }

  function handleDeleteRow(rowIdx: number) {
    const row = formulas[rowIdx];
    const parsed = parseFormula(row.value);

    // Clean up whatever this row created
    if (parsed.kind === "matrix-assign") {
      removeMatrix(parsed.varName);
    } else if (parsed.kind === "vector-assign") {
      removeVector(parsed.varName);
    } else if (parsed.kind === "compute") {
      const resultName = parsed.lhs.trim();
      const exists = vectors.find((v) => v.name === resultName);
      if (exists) removeVector(resultName);
    }

    clearUserVector(rowIdx);

    const updated = formulas.filter((_, i) => i !== rowIdx);
    removeFormula(row.id);
    recomputeAll(updated);
  }

  function addNewBox() {
    addFormula();
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* LEFT PANEL */}
      <div style={{
        width: "33%",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        color: "white",
        minHeight: 0,
      }}>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 0,
        }}>
          <h2 style={{ margin: 0 }}>Linear Algebra Visualizer</h2>

          {/* Formula Boxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {formulas.map((formula, i) => (
              <FormulaBox
                key={formula.id}
                row={formula}
                rowIdx={i}
                onChange={(value) => {
                  const updated = formulas.map((f, idx) =>
                    idx === i ? { ...f, value } : f
                  );
                  setFormulas(updated);
                  recomputeAll(updated);
                }}
                onDelete={() => handleDeleteRow(i)}
                computeResult={computeResult}
              />
            ))}
          </div>

          <button
            onClick={addNewBox}
            style={{
              padding: "7px 14px",
              background: "transparent",
              border: "1px dashed #334155",
              borderRadius: 6,
              color: "#475569",
              cursor: "pointer",
              fontSize: 13,
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#38bdf8";
              (e.target as HTMLButtonElement).style.color = "#38bdf8";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#334155";
              (e.target as HTMLButtonElement).style.color = "#475569";
            }}
          >
            + Add Formula Box
          </button>

          
        </div>

        {/* ChatBox pinned to bottom */}
        <div style={{
          height: 320,
          flexShrink: 0,
          borderTop: "1px solid #1e293b",
        }}>
          <ChatBox />
        </div>
      </div>

      {/* RIGHT — Three.js canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        <div style={{
          position: "absolute",
          top: 20,
          left: 20,
          display: "flex",
          gap: 8,
        }}>
          <button onClick={() => setCameraPosition(CAM_3D)}>3D</button>
          <button onClick={() => setCameraPosition(CAM_2D)}>2D</button>
        </div>
      </div>
    </div>
  );
}