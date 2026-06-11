export default function formatExpressionName(expr: string): string {
  return expr
    .replace(/\s+/g, "")           // remove spaces
    .replace(/\*\*/g, "^")         // ** to ^ before other * replacements
    .replace(/\*/g, "×")           // * to ×
    .replace(/\^2/g, "²")          // ^2 to ²
    .replace(/\^3/g, "³")          // ^3 to ³
    .replace(/\^(\d+)/g, "^$1")    // other powers stay as ^ for now
    .replace(/inv\(([^)]+)\)/g, "$1⁻¹")   // inv(A) to A⁻¹
    .replace(/transpose\(([^)]+)\)/g, "$1ᵀ")  // transpose(A) to Aᵀ
    .replace(/det\(([^)]+)\)/g, "det($1)"); // det stays readable
}