// stores live setters for each FormulaBox input
const registry: Record<number, (value: string) => void> = {};

export const formulaInputRegistry = {
  set(id: number, name: (value: string) => void) {
    registry[id] = name;
  },

  get(id: number) {
    return registry[id];
  },

  type(id: number, value: string) {
    const name = registry[id];
    if (!name) {
      console.warn(`No FormulaBox input registered for id ${id}`);
      return false;
    }
    name(value);
    return true;
  },
};