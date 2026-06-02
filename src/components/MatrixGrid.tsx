import { MatrixEntry } from "./MatrixEntry";

type Props = {
  values: string[][];
  setValues: (v: string[][]) => void;
};

export default function MatrixGrid({ values, setValues }: Props) {

  const handleEntryChange = (row: number, col: number, newValue: string) => {
    const updated = values.map((r, i) =>
      r.map((val, j) =>
        i === row && j === col ? newValue : val
      )
    );

    setValues(updated);
  };

  return (
    <div>
      {values.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: "flex" }}>
          {row.map((val, colIdx) => (
            <MatrixEntry
              key={`${rowIdx}-${colIdx}`}
              row={rowIdx}
              col={colIdx}
              value={val}   
              entryBoxSize="40px"
              onEntryChange={handleEntryChange} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}