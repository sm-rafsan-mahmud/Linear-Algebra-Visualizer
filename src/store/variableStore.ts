import { create } from "zustand";
import type { VariableData } from "../lib/types";

interface VariableStore {
  variables: VariableData[];

  addVariable: (variable: VariableData) => boolean;
  updateVariable: (name: string, value: number) => boolean;
  removeVariable: (name: string) => boolean;
}

export const useVariableStore = create<VariableStore>((set, get) => ({
  variables: [],

  addVariable: (variable) => {
    const name = variable.name.trim();

    if (!name) {
      console.error("Variable name cannot be empty");
      return false;
    }

    const exists = get().variables.some(
      (v) => v.name === name
    );

    if (exists) {
      console.error(`Variable "${name}" already exists`);
      return false;
    }

    set((state) => ({
      variables: [...state.variables, variable],
    }));

    return true;
  },

  updateVariable: (name, value) => {
    const exists = get().variables.some(
      (v) => v.name === name
    );

    if (!exists) {
      console.error(`Variable "${name}" not found`);
      return false;
    }

    set((state) => ({
      variables: state.variables.map((v) =>
        v.name === name
          ? { ...v, value }
          : v
      ),
    }));

    return true;
  },

  removeVariable: (name) => {
    set((state) => ({
      variables: state.variables.filter(
        (v) => v.name !== name
      ),
    }));

    return true;
  },
}));