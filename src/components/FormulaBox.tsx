import { useEffect, useState } from "react";
import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import type { FormulaData } from "../lib/types";
import { parseFormula } from "../utils/parsedFormula";
import MatrixUI from "./MatrixUI";
import VectorUI from "./VectorUI";
import { formulaInputRegistry } from "../utils/formulaInputRegistry";
import ColorPicker from "./ColorPicker";
import { getDefaultColor } from "../lib/utilFunctions";

interface FormulaRowProps {
  row: FormulaData;
  rowIdx: number;
  onChange: (value: string) => void;
  onDelete: () => void;
  computeResult: (lhs: string) => string[] | null;
}

export default function FormulaRow({
  row,
  rowIdx,
  onChange,
  onDelete,
  computeResult,
}: FormulaRowProps) {

  const[value, setValue] = useState(row.value);

  useEffect(() => {
    // Register the input change handler for this row
    formulaInputRegistry.set(row.id, (value: string) => {;
    setValue(value);
    onChange(value);
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[row.id]);

  useEffect(() => {
    // Update the input value when the row value changes
    // Only update local state if it differs to avoid cascading renders
    //eslint-disable-next-line react-hooks/set-state-in-effect
    if (row.value !== value) setValue(row.value);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.value]);


  const addMatrix = useMatrixStore((s) => s.addMatrix);
  const matrices = useMatrixStore((s) => s.matrices);
  const addVector = useVectorStore((s) => s.addVector);
  const vectors = useVectorStore((s) => s.vectors);

  const [selectedName, setSelectedName] = useState<string | null>(null);

  const parsed = parseFormula(row.value);
  const result = parsed.kind === "compute" ? computeResult(parsed.lhs) : null;

  const matchedMatrix =
    parsed.kind === "matrix-assign"
      ? matrices.find((m) => m.name === parsed.varName) ?? null
      : null;

  const matchedVector =
    parsed.kind === "vector-assign"
      ? vectors.find((v) => v.name === parsed.varName) ?? null
      : null;

  const computeVector =
    parsed.kind === "compute"
      ? vectors.find((v) => v.name === parsed.lhs.trim()) ?? null
      : null;

  const hasContent = matchedMatrix || matchedVector || computeVector || (parsed.kind === "compute" && result);

  const updateVector = useVectorStore((s) => s.updateVector);
  
  function handleColorChange(color: string) {
    const targetVector = matchedVector ?? computeVector;
    if (targetVector) {
      updateVector(targetVector.name, targetVector.values, color);
    }
  }

  return (
    <div style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      position: "relative",
    }}>

      {/* Row number */}
      <span style={{
        fontSize: 11,
        color: "#475569",
        fontFamily: "monospace",
        alignSelf: "flex-start",
        paddingTop: 2,
        flexShrink: 0,
      }}>
        {rowIdx + 1}
      </span>

      {/* Variable input — centered vertically */}
      <input
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          onChange(newValue);
        }}
        placeholder= "Enter formula..."
        
        style={{
          width: hasContent ? 60 : 160,
          background: "transparent",
          border: "none",
          borderBottom: "1px solid #475569",
          color: "white",
          padding: "2px 4px",
          fontFamily: "monospace",
          fontSize: 15,
          outline: "none",
          flexShrink: 0,
          alignSelf: "center",
          transition: "width 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderBottomColor = "#38bdf8")}
        onBlur={(e) => (e.target.style.borderBottomColor = "#475569")}
      />

      
      {/* Right side content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>

        {/* + Matrix button */}
        {parsed.kind === "matrix-assign" && !matchedMatrix && (
          <button
            onClick={() => addMatrix({ name: parsed.varName, values: [[""]] })}
            style={{
              background: "transparent",
              border: "1px solid #38bdf8",
              borderRadius: 6,
              color: "#38bdf8",
              padding: "5px 10px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            + Matrix {parsed.varName}
          </button>
        )}

        {/* MatrixUI inline */}
        {matchedMatrix && (
          <MatrixUI
            matrix={matchedMatrix}
            selectedName={selectedName}
            setSelectedName={setSelectedName}
          />
        )}

        {/* + Vector button */}
        {parsed.kind === "vector-assign" && !matchedVector && (
          <button
            onClick={() => addVector({ name: parsed.varName, values: [""], color: getDefaultColor() })}
            style={{
              background: "transparent",
              border: "1px solid #2ECC71",
              borderRadius: 6,
              color: "#2ECC71",
              padding: "5px 10px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            + Vector {parsed.varName}
          </button>
        )}

        {/* VectorUI inline */}
        {(matchedVector || computeVector) && (
          <VectorUI
            vector={matchedVector ?? computeVector!}
            selectedName={selectedName}
            setSelectedName={setSelectedName}
          />
        )}

        {/* Compute result */}
        {parsed.kind === "compute" && result && !computeVector && (
          <div style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}>
            {result.map((val, i) => (
              <span key={i} style={{
                fontFamily: "monospace",
                fontSize: 14,
                color: "#38bdf8",
                minWidth: 36,
                textAlign: "center",
              }}>
                {val}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Delete button — top right corner */}
      <button
        onClick={onDelete}
        title="Delete"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
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
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = "#334155"}
      >
        ×
      </button>

      {/* ColorPicker */}
      {(matchedVector || computeVector) && (
        <ColorPicker
          value={(matchedVector ?? computeVector!).color ? (matchedVector ?? computeVector!).color : getDefaultColor()}
          onChange={handleColorChange}
        />
      )}
    </div>
  );
}