import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, CSSProperties } from "react";

interface ResizeHandleProps {
  axis: "row" | "col" | "both";
  onResize: (deltaRows: number, deltaCols: number) => void;
  cellSize?: number;
}

export default function ResizeHandle({
  axis,
  onResize,
  cellSize = 54, // 50px input + 4px gap
}: ResizeHandleProps) {
  const dragState = useRef({ startX: 0, startY: 0, appliedCols: 0, appliedRows: 0 });

  function handlePointerDown(e: ReactPointerEvent) {
    e.stopPropagation();
    e.preventDefault();

    dragState.current = { startX: e.clientX, startY: e.clientY, appliedCols: 0, appliedRows: 0 };

    function handlePointerMove(ev: PointerEvent) {
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;

      let deltaCols = 0;
      let deltaRows = 0;

      if (axis === "col" || axis === "both") {
        const targetCols = Math.round(dx / cellSize);
        deltaCols = targetCols - dragState.current.appliedCols;
        if (deltaCols !== 0) dragState.current.appliedCols = targetCols;
      }

      if (axis === "row" || axis === "both") {
        const targetRows = Math.round(dy / cellSize);
        deltaRows = targetRows - dragState.current.appliedRows;
        if (deltaRows !== 0) dragState.current.appliedRows = targetRows;
      }

      if (deltaCols !== 0 || deltaRows !== 0) {
        onResize(deltaRows, deltaCols);
      }
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  const cursor =
    axis === "row" ? "row-resize" : axis === "col" ? "col-resize" : "nwse-resize";

  const baseStyle: CSSProperties = {
    position: "absolute",
    background: "transparent",
  };

  const style: CSSProperties =
    axis === "col"
      ? { ...baseStyle, top: 0, right: -6, width: 10, height: "100%", cursor }
      : axis === "row"
      ? { ...baseStyle, left: 0, bottom: -6, height: 10, width: "100%", cursor }
      : {
          ...baseStyle,
          right: -8,
          bottom: -8,
          width: 14,
          height: 14,
          cursor,
          background: "#38bdf8",
          borderRadius: 3,
          zIndex: 2,
        };

  return <div style={style} onPointerDown={handlePointerDown} />;
}