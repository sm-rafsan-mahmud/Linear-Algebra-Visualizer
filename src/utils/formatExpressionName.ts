export default function formatExpressionName(expr: string): string {

  return expr

    // remove unnecessary spaces
    .replace(/\s+/g, "")


    // powers
    .replace(/\*\*/g, "^")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^(\d+)/g, "^$1")


    // multiplication symbols
    .replace(/\*/g, "×")


    // division
    .replace(/\//g, "÷")


    // inverse
    .replace(
      /inv\(([^)]+)\)/g,
      "$1⁻¹"
    )


    // common inverse notation
    .replace(
      /\(([^)]+)\)\^-1/g,
      "($1)⁻¹"
    )


    // transpose
    .replace(
      /transpose\(([^)]+)\)/g,
      "$1ᵀ"
    )


    // short transpose function
    .replace(
      /trans\(([^)]+)\)/g,
      "$1ᵀ"
    )


    // determinant
    .replace(
      /det\(([^)]+)\)/g,
      "det($1)"
    )


    // trace
    .replace(
      /trace\(([^)]+)\)/g,
      "tr($1)"
    )


    // norm
    .replace(
      /norm\(([^)]+)\)/g,
      "‖$1‖"
    )


    // square root
    .replace(
      /sqrt\(([^)]+)\)/g,
      "√($1)"
    )


    // identity matrix
    .replace(
      /\beye\((\d+)\)/g,
      "I$1"
    )


    // zero matrix
    .replace(
      /zeros\((\d+),(\d+)\)/g,
      "0$1×$2"
    )


    // ones matrix
    .replace(
      /ones\((\d+),(\d+)\)/g,
      "1$1×$2"
    )


    // clean scalar multiplication
    .replace(
      /(\d+)×([A-Za-z])/g,
      "$1$2"
    )


    // matrix multiplication symbol
    .replace(
      /([A-Z])([A-Z])/g,
      "$1×$2"
    )


    // clean empty parentheses
    .replace(
      /\(\)/g,
      ""
    );
}