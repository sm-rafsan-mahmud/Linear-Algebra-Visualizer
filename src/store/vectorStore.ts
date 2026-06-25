import { create } from "zustand";
import type { VectorData } from "../lib/types";

interface VectorStore {
  vectors: VectorData[];

  addVector: (vector: VectorData) => boolean;
  updateVector: (name: string, values: string[]) => boolean;
  removeVector: (name: string) => boolean;
  setVectors: (vectors: VectorData[]) => void;
}

export const useVectorStore = create<VectorStore>((set, get) => ({
  vectors: [],

  // ----------------------------
  // SET WHOLE STATE
  // ----------------------------
  setVectors: (vectors) => {
    set({ vectors });
  },

  // ----------------------------
  // ADD VECTOR (VALIDATION)
  // ----------------------------
  addVector: (vector) => {
    const state = get();

    const name = vector.name?.trim();

    // validation: empty name
    if (!name) {
      console.error("Vector name cannot be empty");
      return false;
    }

    // validation: duplicate name
    const exists = state.vectors.some(
      (v) => v.name === name
    );

    if (exists) {
      console.error(`Vector "${name}" already exists`);
      return false;
    }

    set({
      vectors: [
        ...state.vectors,
        {
          ...vector,
          name,
        },
      ],
    });

    return true;
  },

  // ----------------------------
  // UPDATE VECTOR
  // ----------------------------
  updateVector: (name, values) => {
    const state = get();

    const exists = state.vectors.some(
      (v) => v.name === name
    );

    if (!exists) {
      console.error(`Vector "${name}" not found`);
      return false;
    }

    set({
      vectors: state.vectors.map((v) =>
        v.name === name
          ? { ...v, values }
          : v
      ),
    });

    return true;
  },

  // ----------------------------
  // REMOVE VECTOR
  // ----------------------------
  removeVector: (name) => {
    const state = get();

    const exists = state.vectors.some(
      (v) => v.name === name
    );

    if (!exists) {
      console.error(`Vector "${name}" not found`);
      return false;
    }

    set({
      vectors: state.vectors.filter(
        (v) => v.name !== name
      ),
    });

    return true;
  },
}));