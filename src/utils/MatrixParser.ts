import * as math from "mathjs";

const MatrixParser = (values: string[][]): number[][] => {
  return values.map(row =>
    row.map(cell => {
      // 1. Clean up the string
      const trimmed = cell ? cell.trim() : "";
      if (trimmed === "") return 0;

      // 2. Try native conversion first (handles "5", "3.14", etc.)
      const num = Number(trimmed);
      if (!isNaN(num)) return num;

      // 3. Fallback for simple fractions/expressions (like "1/2" or "sqrt(4)")
      try {
        const result = math.evaluate(trimmed);
        return typeof result === "number" ? result : Number(result);
      } catch {
        return 0; // Absolute fallback if garbage text is typed
      }
    })
  );
};

export default MatrixParser;