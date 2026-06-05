import * as math from "mathjs";

const MatrixParser = (values: string[][]): number[][] =>  {
  return values.map(row =>
    row.map(cell => {
      try {
        if (!cell || cell.trim() === "") return 0;

        const result = math.evaluate(cell);

        return typeof result === "number" ? result : Number(result);
      } catch {
        return 0;
      }
    })
  );
}

export default MatrixParser;