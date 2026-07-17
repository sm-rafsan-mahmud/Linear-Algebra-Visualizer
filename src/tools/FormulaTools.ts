// formulaTools.ts

import { useFormulaStore } from "../store/FormulaStore";
import { formulaInputRegistry } from "../utils/formulaInputRegistry";
import { getFormulaByValue } from "./stateTools";

export const formula = {
  add: (value: string) => {
    const store = useFormulaStore.getState();

    store.addFormula(value);

    // get the newly added row
    const newFormula = store.formulas[store.formulas.length - 1];

    // update the actual input field
    formulaInputRegistry.type(newFormula.id, value);

    return newFormula;
  },

  update: (id: number, value: string) => {
    useFormulaStore.getState().updateFormula(id, value);
    formulaInputRegistry.type(id, value);
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