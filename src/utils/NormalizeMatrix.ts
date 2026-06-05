function NormalizeMatrix(result: any): string[][] {
  if (typeof result === "number") {
    return [[String(result)]];
  }

  if (Array.isArray(result) && typeof result[0] === "number") {
    return result.map(v => [String(v)]);
  }

  if (Array.isArray(result)) {
    return result.map(row => row.map(String));
  }

  return [[""]];
}
export default NormalizeMatrix;
