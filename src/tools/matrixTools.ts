import { getMatrix }from "./stateTools";
import MatrixParser from "../utils/MatrixParser";

export function getParsedMatrix(name: string): number[][] {
  const matrix = getMatrix(name);

  if (!matrix) {
    throw new Error(`Matrix "${name}" not found`);
  }

  return MatrixParser(matrix.values);
}



import { addMatrices,
        subtractMatrices,
        multiplyMatrices,
        determinant,
        transposeMatrix,
        inverseMatrix,
        eigenSystem} from "../utils/MatrixOperations";
import { analyzeMatrix } from "../utils/MatrixAnalysis";


export const matrix ={
    add: (a: string, b: string) => {
        const A = getParsedMatrix(a);
        const B = getParsedMatrix(b);

        return addMatrices(A, B);
    },
    subtract: (a: string, b: string) => {
        const A = getParsedMatrix(a);
        const B = getParsedMatrix(b);

        return subtractMatrices(A, B);
    },
    multiply: (a: string, b: string) => {
        const A = getParsedMatrix(a);
        const B = getParsedMatrix(b);

        return multiplyMatrices(A, B);
    },
    det: (a: string) => {
        const A = getParsedMatrix(a);

        return determinant(A);
    },

    inverse: (a: string) => {
        const A = getParsedMatrix(a);

        return inverseMatrix(A);
    },

    transpose: (a: string) => {
        const A = getParsedMatrix(a);

        return transposeMatrix(A);
    },

    eigenVals: (a: string) => {
        const A = getParsedMatrix(a);

        if(A.length !== A[0].length){
            throw new Error("Matrix needs to be sqaure for Eigenvalues")
        }
        return eigenSystem(A).values;
    },

    eigenVectors: (a: string) => {
        const A = getParsedMatrix(a);

        if (A.length !== A[0].length) {
            throw new Error("Matrix needs to be square for Eigen Decomposition");
        }
        return eigenSystem(A).vectors;
    },
    analyze: (a: string) => {
        const A = getParsedMatrix(a);

        if(A.length === 0 || A[0].length === 0){
            throw new Error("Matrix cannot be empty for analysis")
        }

        return analyzeMatrix(A);
    }
}

