export function matchMatrixVectorExpr(
  expr: string,
  matrixNames: string[],
  vectorNames: string[]
): { matrixName: string; vectorName: string } | null {
  const trimmed = expr.trim();
  const pattern = new RegExp(
    `^(${matrixNames.join("|")})\\s*\\*\\s*(${vectorNames.join("|")})$`
  );
  const m = trimmed.match(pattern);
  return m ? { matrixName: m[1], vectorName: m[2] } : null;
}