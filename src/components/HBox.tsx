import type { ReactNode } from "react";

export default function HBox(
{children, height = 120,}: { children: ReactNode; height?: number;}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "12px",
        alignItems: "center",
        height: `${height}px`,
        width: "100%",
        backgroundColor: "#9ac317",
        border: "1px solid #444",
        padding: "10px",
      }}
    >
      {children}
    </div>
  );
}