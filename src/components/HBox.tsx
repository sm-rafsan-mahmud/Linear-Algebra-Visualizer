import type { ReactNode } from "react";
import { Cell } from "./Cell";

const HBOX_MINHEIGHT = "70px";
const HBOX_WIDTH = "100%";
const HBOX_GAP = "12px";

type HBoxProps = {
  rowIdx: number;
  value: string;
  onCellChange: (r: number, c: number, v: string) => void;
  children?: ReactNode; // Children will now hold our ID label and delete button
};

export default function HBox({ rowIdx, value, onCellChange, children }: HBoxProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: HBOX_GAP,
        alignItems: "center",
        justifyContent: "space-between", // Spreads cell and children evenly
        height: "auto",
        minHeight: HBOX_MINHEIGHT,
        width: HBOX_WIDTH,
        backgroundColor: "#f4f4f4",
        border: "1px solid #444",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <span style={{ 
        color: "#334155", 
        fontWeight: "600", 
        fontSize: "14px",
        fontFamily: "sans-serif"
      }}>
        {rowIdx + 1}
      </span>
      {/* 1. Your built-in row cell */}
      <Cell
        row={rowIdx}
        col={0}
        value={value}
        onCellChange={onCellChange}
        onBlur={(r: number, c: number) => console.log("blur", r, c)}
        onFocus={(r: number, c: number) => console.log("focus", r, c)}
      />

      {/* 2. The dynamic ID metadata and delete action buttons drop in here */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {children}
      </div>
    </div>
  );
}