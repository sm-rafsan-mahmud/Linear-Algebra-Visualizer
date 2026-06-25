export default function resizeMatrixValues(
  values: string[][],
  rows: number,
  cols: number
): string[][] {
  const result: string[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(values[r]?.[c] ?? "");
    }
    result.push(row);
  }

  return result;
}