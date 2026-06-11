
/**
 * Converts a math.js matrix evaluation result into a standard string[][]
 * suitable for rendering inside the Matrix UI components.
 */
const NormalizeMatrix = (raw: any): string[][] => {
  // 1. If it's already a regular JavaScript array
  if (Array.isArray(raw)) {
    return ensure2DStringArray(raw);
  }

  // 2. If it's a math.js Matrix object, extract its underlying array
  if (raw && typeof raw.toArray === "function") {
    return ensure2DStringArray(raw.toArray());
  }

  // 3. If it's a single number (e.g. evaluating a determinant or scalar)
  if (typeof raw === "number" || (raw && raw._isBigNumber)) {
    return [[String(raw)]];
  }

  // Fallback default structure if everything else fails
  return [["0"]];
};

/**
 * Helper to guarantee the array is 2D and everything is mapped to strings
 */
function ensure2DStringArray(arr: any[]): string[][] {
  if (arr.length === 0) return [["0"]];

  // If math.js returned a 1D array (like a single vector [1, 2, 3])
  if (!Array.isArray(arr[0])) {
    return [arr.map(val => String(val))];
  }

  // If it's a standard 2D array [[1, 2], [3, 4]]
  return arr.map(row => 
    Array.isArray(row) 
      ? row.map(cell => String(cell))
      : [String(row)]
  );
}

export default NormalizeMatrix;