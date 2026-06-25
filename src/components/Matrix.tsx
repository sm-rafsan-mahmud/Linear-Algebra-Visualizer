import type { ChangeEvent } from "react";
import ResizeHandle from "./ResizeHandle";

interface MatrixProps {
  values: string[][];
  setValues: (row: number, col: number, value: string) => void;
  onResize: (deltaRows: number, deltaCols: number) => void;
}

export default function Matrix({ values, setValues, onResize }: MatrixProps) {
  return (
    <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {values.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 4 }}>
            {row.map((cell, c) => (
              <input
                key={c}
                type="text"
                value={cell}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setValues(r, c, e.target.value)
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
          </div>
        ))}
      </div>

      <ResizeHandle axis="col"  onResize={onResize} />
      <ResizeHandle axis="row"  onResize={onResize} />
      <ResizeHandle axis="both" onResize={onResize} />
    </div>
  );
}