import React from "react";
import { MatrixEntry } from "./MatrixEntry";
type Props = {
  nameID: string;
  values: number[][];
  setValues: (row: number, col: number, newValue: number) => void;
};    

//React.Dispatch<React.SetStateAction<number[][]>>;
export default function Matrix({ nameID, values, setValues }: Props) {

  // const handleEntryChange = (
  //   row: number,
  //   col: number,
  //   newValue: string
  // ) => {
  //   setValues((prev) =>
  //     prev.map((r, i) =>
  //       r.map((val, j) =>
  //         i === row && j === col ? newValue : val
  //       )
  //     )
  //   );
  // };

  const handleEntryChange = (row: number, col: number, newValue: string) => {
    setValues(row, col, Number(newValue));
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