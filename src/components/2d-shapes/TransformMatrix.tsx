import type { ChangeEvent } from "react";

interface TransformMatrixProps {
  values: string[][];
  setValues: (row: number, col: number, value: string) => void;
}

export default function TransformMatrix({ values, setValues }: TransformMatrixProps) {
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
                  width: 100,
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
    </div>
  );
}