import HBox from "./HBox"; 
import type { RowData } from "../lib/types";

interface VBoxProps {
  rows: RowData[];
  onRowCellChange: (rowId: number, newValue: string) => void;
  onDeleteRow?: (rowId: number) => void;
}
export default function VBox({ rows, onRowCellChange, onDeleteRow }: VBoxProps) {
  return (
    <div style={{
      // position: "absolute",   // ← take it out of flex flow
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
      // overflowY: "scroll",   // ← always show scrollbar
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "8px",
    }}>
      {rows.map((row, index) => {
        // Automatically re-calculates 1, 2, 3... sequentially when items are deleted!
        const displayId = index + 1;

        return ( 
          <HBox
            key={row.keyId}
            rowIdx={index}
            value={row.value}
            onCellChange={(r, v) => onRowCellChange(index, v)} 
            />
        );
      })}
    </div>
  );
}