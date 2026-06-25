import * as math from "mathjs";

const VectorParser = (values: string[]): number[] => {
  return values.map((val) => {
    const trimmed = val ? val.trim() : "";

    if (trimmed === "") return 0;

    const num = Number(trimmed);
    if (!isNaN(num)) return num;

    try {
      const result = math.evaluate(trimmed);
      return typeof result === "number" ? result : Number(result);
    } catch {
      return 0;
    }
  });
};

export default VectorParser;