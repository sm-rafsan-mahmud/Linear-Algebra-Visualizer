import type { ChangeEvent } from "react";

interface MatrixProps {
  nameID: string;
  values: string[][];
  setValues: (row: number, col: number, value: string) => void;
}

export default function Matrix({ nameID, values, setValues }: MatrixProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
      {values.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 4 }}>
          {row.map((cell, c) => (
            <input
              key={c}
              type="text"
              value={cell} // Pulls directly from parent state
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setValues(r, c, e.target.value) // Pushes directly to parent state instantly
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
  );
}