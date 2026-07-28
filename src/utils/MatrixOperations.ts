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

export function rref(A: number[][]): number[][] {
    const matrix = A.map(row => [...row]);

    let lead = 0;
    const rows = matrix.length;
    const cols = matrix[0].length;

    for (let r = 0; r < rows; r++) {
        if (cols <= lead) break;

        let i = r;

        while (matrix[i][lead] === 0) {
            i++;

            if (i === rows) {
                i = r;
                lead++;

                if (cols === lead) {
                    return matrix;
                }
            }
        }

        // swap rows
        [matrix[i], matrix[r]] = [matrix[r], matrix[i]];

        // divide pivot row
        const pivot = matrix[r][lead];

        matrix[r] = matrix[r].map(
            value => value / pivot
        );

        // eliminate other rows
        for (let j = 0; j < rows; j++) {
            if (j !== r) {
                const factor = matrix[j][lead];

                matrix[j] = matrix[j].map(
                    (value, k) =>
                        value - factor * matrix[r][k]
                );
            }
        }

        lead++;
    }

    return matrix;
}