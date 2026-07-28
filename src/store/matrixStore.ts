import { create } from 'zustand'
import type { MatrixData } from "../lib/types";

interface MatrixStore {
  matrices: MatrixData[];

  addMatrix: (matrix: MatrixData) => boolean;
  updateMatrix: (name: string, values: string[][]) => boolean;
  updateMatrixAnalysis: (name: string, analysis: any) => boolean;
  removeMatrix: (name: string) => boolean;
  setMatrices: (matrices: MatrixData[]) => void;
}

export const useMatrixStore = create<MatrixStore>((set, get) => ({
  matrices: [],

  // SET WHOLE STATE
  setMatrices: (matrices) => {
    set({ matrices });
  },


  // ADD MATRIX (emoty name and same name must throw an error)

  addMatrix: (matrix) => {
    const state = get();

    const name = matrix.name?.trim();

    // validation: empty name
    if (!name) {
      console.error("Matrix name cannot be empty");
      return false;
    }

    // validation: duplicate name
    const exists = state.matrices.some(
      (m) => m.name === name
    );

    if (exists) {
      console.error(`Matrix "${name}" already exists`);
      return false;
    }

    set({
      matrices: [
        ...state.matrices,
        {
          ...matrix,
          name,
        },
      ],
    });

    return true;
  },

  // ----------------------------
  // UPDATE MATRIX (Must make sure the matrix exits)
  updateMatrix: (name, values) => {
    const state = get();

    const exists = state.matrices.some(
      (m) => m.name === name
    );

    if (!exists) {
      console.error(`Matrix "${name}" not found`);
      return false;
    }

    set({
      matrices: state.matrices.map((m) =>
        m.name === name
          ? { ...m, values }
          : m
      ),
    });

    return true;
  },

  // ----------------------------
  updateMatrixAnalysis: (name, analysis) => {

  const state = get();

  const exists = state.matrices.some(
    m => m.name === name
  );

  if(!exists){
    console.error(`Matrix "${name}" not found`);
    return false;
  }


  set({
    matrices: state.matrices.map(matrix =>
      matrix.name === name
        ? {
            ...matrix,
            analysis
          }
        : matrix
    )
  });


  return true;
},

  // REMOVE MATRIX(Matrix must exist)
  removeMatrix: (name) => {
    const state = get();

    const exists = state.matrices.some(
      (m) => m.name === name
    );

    if (!exists) {
      console.error(`Matrix "${name}" not found`);
      return false;
    }

    set({
      matrices: state.matrices.filter(
        (m) => m.name !== name
      ),
    });

    return true;
  },
}));

