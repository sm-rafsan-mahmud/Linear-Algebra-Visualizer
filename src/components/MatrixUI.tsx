import type { MatrixData } from "../lib/types";
import Matrix from "./Matrix";

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
};

export default function MatrixUI({
  matrix,
  index,
  selectedIdx,
  setSelectedIdx,
  handleValueChange,
}: MatrixUIProps) {
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
      <strong>{matrix.nameID}</strong>

      <Matrix
        values={matrix.values}
        setValues={(row, col, val) =>
          handleValueChange(index, row, col, val)
        }
      />
    </div>
  );
}