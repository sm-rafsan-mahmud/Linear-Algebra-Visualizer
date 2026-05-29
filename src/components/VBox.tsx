export default function VBox({ rows }: any) {
  return (
    <div style={{
      position: "absolute",   // ← take it out of flex flow
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: "scroll",   // ← always show scrollbar
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "8px",
    }}>
      {rows.map((row: any) => (
        <div key={row.id} style={{
          height: "60px",
          minHeight: "60px",
          flexShrink: 0,
          width: "100%",
          backgroundColor: "#9ac317",
          border: "1px solid #444",
          borderRadius: "4px",
          padding: "0 12px",
          color: "#fff",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}>
          {row.content}
        </div>
      ))}
    </div>
  );
}