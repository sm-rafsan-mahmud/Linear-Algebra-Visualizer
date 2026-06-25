import type { ChangeEvent } from "react";
import ResizeHandle from "./ResizeHandle";

interface VectorProps {
  values: string[];
  setValues: (index: number, value: string) => void;
  onResize: (deltaLength: number) => void;
}

export default function Vector({ values, setValues, onResize }: VectorProps) {
  return (
    <div style={{ position: "relative", display: "inline-flex", gap: 4, marginTop: 8 }}>
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
        />
      ))}

      <ResizeHandle axis="col" onResize={(_deltaRows, deltaCols) => onResize(deltaCols)} />
    </div>
  );
}