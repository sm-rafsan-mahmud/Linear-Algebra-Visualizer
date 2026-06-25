import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import { matrix } from "../tools/MatrixTools";
import { vector } from "../tools/vectorTools";

export function buildAgentContext() {
  const matrixStore = useMatrixStore.getState();
  const vectorStore = useVectorStore.getState();

  return {
    // Matrix store
    addMatrix: (name: string, values: string[][]) =>
      matrixStore.addMatrix({ name, values }),
    updateMatrix: (name: string, values: string[][]) =>
      matrixStore.updateMatrix(name, values),
    removeMatrix: (name: string) =>
      matrixStore.removeMatrix(name),
    listMatrices: () =>
      matrixStore.matrices.map((m) => m.name),
    getMatrix: (name: string) =>
      matrixStore.matrices.find((m) => m.name === name),

    // Vector store
    addVector: (name: string, values: string[]) =>
      vectorStore.addVector({ name, values }),
    updateVector: (name: string, values: string[]) =>
      vectorStore.updateVector(name, values),
    removeVector: (name: string) =>
      vectorStore.removeVector(name),
    listVectors: () =>
      vectorStore.vectors.map((v) => v.name),
    getVector: (name: string) =>
      vectorStore.vectors.find((v) => v.name === name),

    // Math tools
    matrix,
    vector,
  };
}

export type AgentContext = ReturnType<typeof buildAgentContext>;