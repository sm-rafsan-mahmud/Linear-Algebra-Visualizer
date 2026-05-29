import { useState } from "react";
import VBox from "./components/VBox";

interface RowData {
  id: number;
  content: string;
}

export default function Transformations() {
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, content: "Transformation Step 1" }
  ]);

  const addRow = () => {
    const nextId = rows.length + 1;
    setRows([...rows, { id: nextId, content: `Transformation Step ${nextId}` }]);
  };

  return (
    // Outer wrapper: full screen, horizontal split
    <div style={{
      display: "flex",
      flexDirection: "row",
      width: "100vw",
      height: "100vh",
      background: "#0f172a",
      overflow: "hidden",
    }}>

      {/* LEFT SIDEBAR — 1/3 width, column, does NOT scroll itself */}
      <div style={{
        flex: "0 0 33.33%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "12px",
        borderRight: "2px solid #1e293b",
        overflow: "hidden",  // sidebar itself must not scroll
        boxSizing: "border-box",
      }}>

        <h1 style={{ color: "#fff", margin: 0, fontSize: "1.4rem", flexShrink: 0 }}>
          Transformations
        </h1>

        <button onClick={addRow} style={{
          flexShrink: 0,
          padding: "10px 15px",
          background: "#38bdf8",
          border: "none",
          borderRadius: "4px",
          fontWeight: "bold",
          color: "#0f172a",
          cursor: "pointer",
          fontSize: "14px",
        }}>
          Add Row
        </button>

        {/* VBox fills remaining space and scrolls */}
        <VBox rows={rows} />
      </div>

      {/* RIGHT VIEWPORT — 2/3 width */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: "14px",
      }}>
        3D Viewport Workspace
      </div>

    </div>
  );
}