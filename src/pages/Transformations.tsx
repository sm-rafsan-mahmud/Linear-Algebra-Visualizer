import { useState } from "react";
import VBox from "../components/VBox";
import { useTransformations } from '../hooks/useTransformations'
import InputVector from '../components/Transformations/InputVector'

interface RowData {
  id: number;
  content: string;
}


export default function Transformations() {
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, content: "Transformation Step 1" },
  ]);

  const addRow = () => {
    const nextId = rows.length + 1;
    setRows([...rows, { id: nextId, content: `Transformation Step ${nextId}` }]);
  };

  // header ~48px + button ~44px + gaps ~44px = ~136px
  const HEADER_HEIGHT = 136;

  const {
        mountRef,
        newVector,
        setCameraPosition,
        CAM_3D,
        CAM_2D
    } = useTransformations();

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

        {/* VBox scroll area — explicit height, no flex magic */}
        <div style={{
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <VBox rows={rows} />
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
            <InputVector onNewVector={newVector} />
        </div>
    </div>

    </div>
  )
}