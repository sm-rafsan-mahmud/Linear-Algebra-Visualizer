import { create } from "zustand";
import type { FormulaData } from "../lib/types";

interface FormulaStore {
  formulas: FormulaData[];
  addFormula: (value?: string) => void;
  updateFormula: (id: number, value: string) => void;
  removeFormula: (id: number) => void;
  setFormulas: (formulas: FormulaData[]) => void;
}

export const useFormulaStore = create<FormulaStore>((set, get) => ({
  formulas: [{ id: 1, value: "" }],

  addFormula: (value = "") => {
    const state = get();
    const maxId = state.formulas.reduce((m, r) => (r.id > m ? r.id : m), 0);
    set({ formulas: [...state.formulas, { id: maxId + 1, value }] });
  },

  updateFormula: (id: number, value: string) => {
    set({
      formulas: get().formulas.map((r) => (r.id === id ? { ...r, value } : r)),
    });
  },

  removeFormula: (id: number) => {
    set({ formulas: get().formulas.filter((r) => r.id !== id) });
  },

  setFormulas: (formulas: FormulaData[]) => set({ formulas: formulas }),
}));