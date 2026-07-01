import type { VectorData } from "../lib/types";
import Vector from "./Vector";
import { useVectorStore } from "../store/vectorStore";
import resizeVectorValues from "../utils/ResizeVector";

export default function VectorUI({
  vector,
  selectedName,
  setSelectedName,
  color,
}: {
  vector: VectorData;
  selectedName: string | null;
  setSelectedName: (name: string) => void;
  color?: string;
}) {
  const updateVector = useVectorStore((s) => s.updateVector);

  const len = vector.values.length;

  function handleValueChange(i: number, val: string) {
    const newValues = vector.values.map((v, idx) => (idx === i ? val : v));
    updateVector(vector.name, newValues);
  }

  function handleResize(deltaLength: number) {
    const newLength = Math.max(1, len + deltaLength);
    if (newLength === len) return;
    updateVector(vector.name, resizeVectorValues(vector.values, newLength));
  }

  return (
    <div
      onClick={() => setSelectedName(vector.name)}
      style={{
        outline: selectedName === vector.name ? "2px solid #38bdf8" : "none",
        padding: 8,
        marginBottom: 12,
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        {/* Name + color dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {color && (
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }} />
          )}
        </div>

        {/* Resize controls */}
        <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <span style={labelStyle}>Length</span>
          <button style={btnStyle} onClick={() => handleResize(-1)}>−</button>
          <span style={countStyle}>{len}</span>
          <button style={btnStyle} onClick={() => handleResize(1)}>+</button>
        </div>
      </div>

      <Vector
        values={vector.values}
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