export type ParsedFormula =
  | { kind: "plain" }
  | { kind: "matrix-assign"; varName: string }
  | { kind: "vector-assign"; varName: string }
  | { kind: "matrix-expression"; varName: string; expression: string }
  | { kind: "vector-expression"; varName: string; expression: string }
  | { kind: "variable-assign"; varName: string; expression: string }
  | { kind: "compute"; expression: string };


export function parseFormula(value: string): ParsedFormula {

  const normalized =
    value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*=\s*/g, "=");


  if (!normalized.includes("=")) {
    return {
      kind: "compute",
      expression: normalized
    };
  }

  const [left, ...rest] =
    normalized.split("=");


  const lhs = left.trim();
  const rhs = rest.join("=").trim();

  /*
    Empty assignment

    A=
    v=
  */
  if(rhs===""){

    if(/^[A-Z][a-zA-Z0-9_]*$/.test(lhs)){

      return {
        kind:"matrix-assign",
        varName:lhs
      };

    }


    if(/^[a-z][a-zA-Z0-9_]*$/.test(lhs)){

      return {
        kind:"vector-assign",
        varName:lhs
      };

    }

  }


  /*
    Assignment with expression

    B=A+B
    v=A*u
  */

  if(rhs.length>0){


    if(/^[A-Z][a-zA-Z0-9_]*$/.test(lhs)){

      return {
        kind:"matrix-expression",
        varName:lhs,
        expression:rhs
      };

    }

    if(/^[a-z][a-zA-Z0-9_]*$/.test(lhs)){

      return {
        kind:"vector-expression",
        varName:lhs,
        expression:rhs
      };

    }
    return {
      kind:"variable-assign",
      varName:lhs,
      expression:rhs
    };

  }

  return {
    kind:"plain"
  };
}