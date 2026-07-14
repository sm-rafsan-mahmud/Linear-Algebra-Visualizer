export type ParsedFormula =
  | { kind: "plain" }
  | { kind: "matrix-assign"; varName: string }
  | { kind: "vector-assign"; varName: string }
  | { kind: "compute"; lhs: string };

export function parseFormula(value: string): ParsedFormula {
  const trimmed = value.trim();
  const eqMatch = trimmed.match(/^(.*?)\s*=\s*$/);

  if (!eqMatch) return { kind: "plain" };

  const lhs = eqMatch[1].trim();

  if (/^[A-Z][a-zA-Z0-9_]*$/.test(lhs)) return { kind: "matrix-assign", varName: lhs };
  if (/^[a-z][a-zA-Z0-9_]*$/.test(lhs)) return { kind: "vector-assign", varName: lhs };
  if (lhs.length > 0) return { kind: "compute", lhs };

  return { kind: "plain" };
}