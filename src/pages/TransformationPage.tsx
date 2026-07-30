import { useEffect, useState } from "react";
import FormulaBox from "../components/FormulaBox";
import ChatBox from "../components/chatBox";
import { useTransformationPage } from "../hooks/3d-vectors/useTransformationPage";
import type { Page } from "../lib/types";
import VectorParser from "../utils/VectorParser";
import { parseFormula } from "../utils/parsedFormula";
import { getDefaultColor } from "../lib/utilFunctions";
import { MessageCircle, X } from "lucide-react";
import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import { useFormulaStore } from "../store/FormulaStore";
import { useVariableStore } from "../store/variableStore";

interface TransformationPageProps {
  swapPage: (nextPage: Page) => void;
}

export default function TransformationPage({ swapPage }: TransformationPageProps) {
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

  const removeMatrix = useMatrixStore((s) => s.removeMatrix);
  const vectors = useVectorStore((s) => s.vectors);
  const removeVector = useVectorStore((s) => s.removeVector);
  const removeVariable = useVariableStore((s) => s.removeVariable);

  const [chatOpen, setChatOpen] = useState(false);

  /* Sync vectors to Three.js (Skip computed vectors) */
  useEffect(() => {
    const resultNames = new Set(
      formulas
        .map((f) => parseFormula(f.value))
        .filter((p: any) => p && p.kind === "compute")
        .map((p: any) => p.lhs?.trim())
        .filter(Boolean)
    );

    const userVectors = vectors.filter((v) => !resultNames.has(v.name));
    
    userVectors.forEach((vec, i) => {
      const nums = VectorParser(vec.values);

      if (nums.length < 2 || nums.length > 3 || nums.some(isNaN)) {
        clearUserVector(i);
        return;
      }

      setUserVector(i, nums[0], nums[1], nums[2] ?? 0, vec.color ?? getDefaultColor(), vec.name);
    });

    for (let i = userVectors.length; i < 20; i++) {
      clearUserVector(i);
    }
  }, [vectors, formulas]);

  function handleDeleteRow(rowIdx: number) {
    const row = formulas[rowIdx];
    const parsed: any = parseFormula(row.value);

    if (parsed?.kind === "matrix-assign") {
      if (parsed.varName) removeMatrix(parsed.varName);
    } else if (parsed?.kind === "vector-assign") {
      if (parsed.varName) removeVector(parsed.varName);
    } else if (parsed?.kind === "variable-assign") {
      if (parsed.varName) removeVariable(parsed.varName);
    } else if (parsed?.kind === "compute") {
      const resultName = (parsed.lhs ?? parsed.expression)?.trim();
      if (resultName) removeVector(resultName);
    }

    clearUserVector(rowIdx);
    removeFormula(row.id);
  }

  function addNewBox() {
    addFormula();
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* LEFT PANEL */}
      <div style={{ width: "33%", display: "flex", flexDirection: "column", background: "#0f172a", color: "white", minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <h2>Linear Algebra Visualizer</h2>
            <button onClick={() => swapPage("shapes")}>Shapes</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {formulas.map((formula, i) => (
              <FormulaBox
                key={formula.id}
                row={formula}
                rowIdx={i}
                onChange={(value) => {
                  const updated = formulas.map((f, idx) => (idx === i ? { ...f, value } : f));
                  setFormulas(updated);
                }}
                onDelete={() => handleDeleteRow(i)}
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
            }}
          >
            + Add Formula Box
          </button>
        </div>

        <button
          onClick={() => setChatOpen((p) => !p)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          {chatOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>

        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 420,
            height: 320,
            zIndex: 999,
            borderRadius: 12,
            overflow: "hidden",
            opacity: chatOpen ? 1 : 0,
            pointerEvents: chatOpen ? "auto" : "none",
          }}
        >
          <ChatBox />
        </div>
      </div>

      {/* THREE JS */}
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