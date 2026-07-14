import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import { useFormulaStore } from "../store/FormulaStore";
import { matrix } from "../tools/matrixTools";
import { vector } from "../tools/vectorTools";
import { formula } from "../tools/FormulaTools";


export function buildAgentContext() {
  const matrixStore = useMatrixStore.getState();
  const vectorStore = useVectorStore.getState();
  const formulaStore = useFormulaStore.getState();

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

    // Formula store
    addFormulaRow: (value: string) => formulaStore.addFormula(value),
    updateFormulaRow: (id: number, value: string) => formulaStore.updateFormula(id, value),
    removeFormulaRow: (id: number) => formulaStore.removeFormula(id),
    listFormulaRows: () => formulaStore.formulas.map((f) => f.id),
    getFormulaRow: (id: number) => formulaStore.formulas.find((f) => f.id === id),
    
    // Math tools
    matrix,
    vector,
    formula,
  };
}

export type AgentContext = ReturnType<typeof buildAgentContext>;