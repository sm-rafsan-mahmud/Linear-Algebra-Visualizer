import HBox from "./HBox"; 
import type { RowData } from "../lib/types";

interface VBoxProps {
  rows: RowData[];
  onRowCellChange: (rowId: number, newValue: string) => void;
  //onDeleteRow?: (rowId: number) => void;
}
export default function VBox({ rows, onRowCellChange }: VBoxProps) {
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
        return ( 
          <HBox
            key={row.keyId}
            rowIdx={index}
            value={row.value}
            onCellChange={(_, v) => onRowCellChange(index, v)} 
            />
        );
      })}
    </div>
  );
}