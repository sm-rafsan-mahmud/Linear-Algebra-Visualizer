import { useFormulaStore } from "../store/FormulaStore";
import { useMatrixStore } from "../store/matrixStore";
import { useVariableStore } from "../store/variableStore";
import { useVectorStore } from "../store/vectorStore";


export function getMatrix(name: string){
    return useMatrixStore.getState().matrices.find(m=> m.name === name);
}

export function listMatrices(){
    return useMatrixStore.getState().matrices.map(m=> m.name);
}
export function getVector(name: string){
    return useVectorStore.getState().vectors.find((vec)=> vec.name === name);
}

export function listVectors(){
    return useVectorStore.getState().vectors.map(vec=> vec.name);
}


export function getVariable(name: string){
    return useVariableStore.getState().variables.find((variable)=> variable.name===name);
}

export function listVariable(){
    return useVariableStore.getState().variables.map(variable => variable.name);
}

export function getFormula(id: number){
    return useFormulaStore.getState().formulas.find((formula)=> formula.id === id);
}

export function listFormulas(){
    return useFormulaStore.getState().formulas.map(formula => formula.id);
}

export function getFormulaByValue(value: string) {
  return useFormulaStore.getState().formulas.find((f) => f.value.trim() === value.trim());
}
