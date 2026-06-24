import type { MatrixData } from "../lib/types";
import Matrix from "./Matrix";
import ColorPicker from "./ColorPicker";

type MatrixUIProps = {
  matrix: MatrixData;
  index: number;
  selectedIdx: number | null;
  setSelectedIdx: (idx: number) => void;
  handleValueChange: (
    matIdx: number,
    row: number,
    col: number,
    val: string
  ) => void;
  vectorColor: string;
  onColorChange: (color: string) => void;
};

export default function MatrixUI({
  matrix,
  index,
  selectedIdx,
  setSelectedIdx,
  handleValueChange,
  vectorColor,
  onColorChange
}: MatrixUIProps) {
  // const [vectorColor, setVectorColor] = useState(getDefaultColor)

  return (
    <div
      onClick={() => setSelectedIdx(index)}
      style={{
        outline: selectedIdx === index
          ? "2px solid #38bdf8"
          : "none",
        padding: 8,
        marginBottom: 12,
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <strong>{matrix.nameID}</strong>

          <Matrix
            values={matrix.values}
            setValues={(row, col, val) =>
              handleValueChange(index, row, col, val)
            }
          />
        </div>
        <ColorPicker value={vectorColor} onChange={onColorChange} />
      </div>
    </div>
  );
}