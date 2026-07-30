// formulaTools.ts

import { useFormulaStore } from "../store/FormulaStore";
import { formulaInputRegistry } from "../utils/formulaInputRegistry";
import { getFormulaByValue } from "./stateTools";

export const formula = {
  add: (value: string) => {
    
  console.log(
    "Before adding:",
    useFormulaStore.getState().formulas
  );

  useFormulaStore.getState().addFormula(value);

  console.log(
    "After adding:",
    useFormulaStore.getState().formulas
  );

  const formulas = useFormulaStore.getState().formulas;
  const newFormula = formulas[formulas.length - 1];

  console.log("New formula:", newFormula);

  return newFormula;
},

  remove: (id: number) => {
    useFormulaStore.getState().removeFormula(id);
  },

  removeByValue: (value: string) => {
    const f = getFormulaByValue(value);

    if (!f) {
      console.error(`Formula "${value}" not found`);
      return false;
    }

    useFormulaStore.getState().removeFormula(f.id);
    return true;
  },

  list: () =>
    useFormulaStore.getState().formulas.map((f) => f.value),
};