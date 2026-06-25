export default function resizeVectorValues(
  values: string[],
  length: number
): string[] {
  const result: string[] = [];

  for (let i = 0; i < length; i++) {
    result.push(values[i] ?? "");
  }

  return result;
}