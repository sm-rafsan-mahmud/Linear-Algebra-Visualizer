import { create } from "zustand";
import type { VectorData } from "../lib/types";

interface VectorStore {
  vectors: VectorData[];

  setVectors: (vectors: VectorData[]) => void;

  addVector: (vector: VectorData) => void;

  removeVector: (id: string) => void;
}

export const useVectorStore = create<VectorStore>((set) => ({
  vectors: [],

  setVectors: (vectors) => set({ vectors }),

  addVector: (vector) =>
    set((state) => ({
      vectors: [...state.vectors, vector],
    })),

  removeVector: (id) =>
    set((state) => ({
      vectors: state.vectors.filter((v) => v.name !== id),
    })),
}));