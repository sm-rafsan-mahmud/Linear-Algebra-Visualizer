import type { ChangeEvent } from "react";
import ResizeHandle from "./ResizeHandle";

interface VectorProps {
  values: string[];
  setValues: (index: number, value: string) => void;
  onResize: (deltaLength: number) => void;
}

export default function Vector({ values, setValues, onResize }: VectorProps) {
  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
      {values.map((cell, i) => (
        <input
          key={i}
          type="text"
          value={cell}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValues(i, e.target.value)
          }
          style={{
            width: 50,
            textAlign: "center",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 4,
            color: "#38bdf8",
            padding: "4px 0",
            fontFamily: "monospace",
          }}
          onFocus={(e) => (e.target.style.borderBottomColor = "#38bdf8")}
          onBlur={(e) => (e.target.style.borderBottomColor = "#334155")}
        />
      ))}

      <ResizeHandle axis="row" onResize={(deltaRows) => onResize(deltaRows)} />
    </div>
  );
}