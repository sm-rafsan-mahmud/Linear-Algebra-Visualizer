import { useEffect, useState } from "react";
import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import type { FormulaData } from "../lib/types";
import { parseFormula } from "../utils/parsedFormula";
import { evaluateFormula } from "../utils/evaluator";
import { formulaInputRegistry } from "../utils/formulaInputRegistry";
import MatrixUI from "./MatrixUI";
import VectorUI from "./VectorUI";
import MatrixProperties from "./MatrixProperties";
import ColorPicker from "./ColorPicker";
import { getDefaultColor } from "../lib/utilFunctions";

interface FormulaRowProps {
  row: FormulaData;
  rowIdx: number;
  onChange: (value: string) => void;
  onDelete: () => void;
}

export default function FormulaRow({ row, rowIdx, onChange, onDelete }: FormulaRowProps) {
  const [value, setValue] = useState(row.value);
  const [result, setResult] = useState<any>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [showProperties, setShowProperties] = useState(false);

  const matrices = useMatrixStore((s) => s.matrices);
  const vectors = useVectorStore((s) => s.vectors);
  const updateVector = useVectorStore((s) => s.updateVector);

  useEffect(() => {
    formulaInputRegistry.set(row.id, (v: string) => {
      setValue(v);
      onChange(v);
    });

    return () => {
      formulaInputRegistry.delete(row.id);
    };
  }, [row.id, onChange]);

  useEffect(() => {
    if (row.value !== value) setValue(row.value);
  }, [row.value]);

  useEffect(() => {
    if (!row.value.trim()) {
      setResult(null);
      return;
    }

    const output = evaluateFormula(row.value);
    setResult(output ?? null);
  }, [row.value]);

  const parsed = parseFormula(row.value);

  const variableName =
    parsed.kind === "matrix-assign" ||
    parsed.kind === "matrix-expression" ||
    parsed.kind === "vector-assign" ||
    parsed.kind === "vector-expression"
      ? parsed.varName
      : null;

  const matchedMatrix = variableName ? matrices.find((m) => m.name === variableName) ?? null : null;
  const matchedVector = variableName ? vectors.find((v) => v.name === variableName) ?? null : null;
  const hasContent = matchedMatrix || matchedVector || result;

  function handleColorChange(color: string) {
    if (matchedVector) {
      updateVector(matchedVector.name, matchedVector.values, color);
    }
  }

  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        position: "relative",
      }}
    >
      <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
        {rowIdx + 1}
      </span>

      <input
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          onChange(v);
        }}
        placeholder="Enter formula..."
        style={{
          width: hasContent ? 80 : 160,
          background: "transparent",
          border: "none",
          borderBottom: "1px solid #475569",
          color: "white",
          fontFamily: "monospace",
          fontSize: 15,
          outline: "none",
        }}
      />

      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        {result?.type === "matrix" && (
          <MatrixUI
            matrix={{ name: result.name ?? "result", values: result.values }}
            selectedName={selectedName}
            setSelectedName={setSelectedName}
          />
        )}

        {result?.type === "vector" && (
          <VectorUI
            vector={{ name: result.name ?? "result", values: result.values, color: getDefaultColor() }}
            selectedName={selectedName}
            setSelectedName={setSelectedName}
          />
        )}

        {result?.type === "scalar" && (
          <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>{result.value}</span>
        )}

        {!result && matchedMatrix && (
          <>
            <MatrixUI matrix={matchedMatrix} selectedName={selectedName} setSelectedName={setSelectedName} />
            {showProperties && <MatrixProperties matrix={matchedMatrix} />}
          </>
        )}

        {!result && matchedVector && (
          <VectorUI vector={matchedVector} selectedName={selectedName} setSelectedName={setSelectedName} />
        )}

        {parsed.kind === "matrix-assign" && !matchedMatrix && (
          <button
            onClick={() => {
              useMatrixStore.getState().addMatrix({ name: parsed.varName, values: [[""]] });
            }}
          >
            + Matrix {parsed.varName}
          </button>
        )}

        {parsed.kind === "vector-assign" && !matchedVector && (
          <button
            onClick={() => {
              useVectorStore.getState().addVector({
                name: parsed.varName,
                values: [""],
                color: getDefaultColor(),
              });
            }}
          >
            + Vector {parsed.varName}
          </button>
        )}
      </div>

      <div style={{ position: "absolute", right: 6, top: 6, display: "flex", gap: 8 }}>
        <button onClick={() => setShowProperties((p) => !p)}>?</button>
        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}
        >
          ×
        </button>
        {matchedVector && (
          <ColorPicker
            value={matchedVector.color ?? getDefaultColor()}
            onChange={handleColorChange}
          />
        )}
      </div>
    </div>
  );
}