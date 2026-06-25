import  {add, subtract, multiply, transpose, inv, det, eigs} from "mathjs";

export function addMatrices(A: number[][], B: number[][]): number[][] {
    return add(A, B) as number[][];
}

export function subtractMatrices(A: number[][], B: number[][]): number[][] {
    return subtract(A, B) as number[][];
}

export function multiplyMatrices(A: number[][], B: number[][]): number[][] {
    return multiply(A, B) as number[][];
}

export function transposeMatrix(A: number[][]): number[][] {
    return transpose(A) as number[][];
}

export function scalarMultiplyMatrix(scalar: number, A: number[][]): number[][] {
    return A.map(row => row.map(value => scalar * value));
}

export function determinant(A: number[][]): number {
    if (A.length !== A[0].length) {
        throw new Error("Matrix must be square to compute determinant.");
    }
    return det(A);
}

export function inverseMatrix(A: number[][]): number[][] {
    if (A.length !== A[0].length) {
        throw new Error("Matrix must be square to compute inverse.");
    }
    return inv(A) as number[][];
}

export function eigenSystem(A: number[][]){
    const result = eigs(A);

    return {
        values: result.values,
        vectors: result.eigenvectors,
    }
    
}