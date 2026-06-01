import { useState } from "react";
import VBox from "../components/VBox";
import type { Page } from '../lib/types';
import { useTransformations } from '../hooks/useTransformations';
import { Cell } from "../components/Cell";

interface RowData {
  id: number;     // Unique identifier for loops and state updates
  value: string;  // The actual formula or number inside the row's cell
}

type Props = {
  onNavigate: (page: Page) => void;
};

export default function Transformations({ onNavigate }: Props) {
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, value: "" },
  ]);

  const addRow = () => {
    const maxId = rows.reduce((max, row) => (row.id > max ? row.id : max), 0);
    const nextId = maxId + 1;
    setRows([...rows, { id: nextId, value: "" }]);
  };

  
  const HEADER_HEIGHT = 136;

  const {
        mountRef,
        newVector,
        setCameraPosition,
        CAM_3D,
        CAM_2D
    } = useTransformations();
  //const { mountRef } = useTransformations();
    
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      width: "100vw",
      height: "100vh",
      background: "#0f172a",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>

      {/* LEFT SIDEBAR */}
      <div style={{
        width: "33.33%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "12px",
        borderRight: "2px solid #1e293b",
        boxSizing: "border-box",
        overflow: "hidden",
      }}>

        <h1 style={{
          color: "#fff",
          margin: 0,
          fontSize: "1.4rem",
          fontWeight: 600,
        }}>
          Transformations
        </h1>

        <button
          onClick={addRow}
          style={{
            padding: "10px 15px",
            background: "#38bdf8",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            color: "#0f172a",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Add Row
        </button>

        {/* Scroll Container Wrapper */}
        <div style={{
          flex: 1,
          position: "relative", /* Establishes a boundary for VBox's absolute positioning */
          minHeight: 0,          /* Critical fix for nested flex scrolling engines */
        }}>
          <VBox rows={rows} onRowCellChange={(rowId, newValue) => {
            setRows(rows.map(row => row.id === rowId ? { ...row, value: newValue } : row));
          }} />
        </div>

      </div>

      {/* RIGHT VIEWPORT */}
    <div style={{ flex: 1, position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
        <div id="camera-pos" style={{ position: "absolute", top: "20px", left: "20px", color: "#fff" }}>
          <button onClick={() => setCameraPosition(CAM_3D)}>3D</button>
          <button onClick={() => setCameraPosition(CAM_2D)}>2D</button>
        </div>
        <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
            {/* <InputVector onNewVector={newVector} /> */}
        </div>
    </div>
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: "14px",
      }}>
        {/* Workspace content */}
      </div>

    </div>
  );
}