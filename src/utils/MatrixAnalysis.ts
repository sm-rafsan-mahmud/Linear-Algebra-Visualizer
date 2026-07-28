import { rref } from "./MatrixOperations";


export function rankFromRREF(R: number[][]): number {
    return R.filter(row =>
        row.some(value => Math.abs(value) > 1e-10)
    ).length;
}


// Find pivot columns in RREF matrix
// A pivot column is a column that contains a leading 1 in RREF
export function findPivotColumns(R: number[][]): number[] {
    const pivots: number[] = [];

    for (let row = 0; row < R.length; row++) {

        for (let col = 0; col < R[0].length; col++) {

            if (Math.abs(R[row][col] - 1) < 1e-10) {

                let isPivot = true;

                for (let otherRow = 0; otherRow < R.length; otherRow++) {

                    if (
                        otherRow !== row &&
                        Math.abs(R[otherRow][col]) > 1e-10
                    ) {
                        isPivot = false;
                        break;
                    }
                }

                if (isPivot) {
                    pivots.push(col);
                    break;
                }
            }
        }
    }

    return pivots;
}


// Basis of column space
export function getBasis(
    A: number[][],
    pivotColumns: number[]
): number[][] {

    return pivotColumns.map(col =>
        A.map(row => row[col])
    );
}


// Null space of a Matrix
export function getNullSpace(
    R: number[][]
): number[][] {

    const pivotColumns = findPivotColumns(R);

    const cols = R[0].length;

    const freeColumns = [];

    // Find free variables
    for (let col = 0; col < cols; col++) {

        if (!pivotColumns.includes(col)) {
            freeColumns.push(col);
        }
    }


    const basisVectors: number[][] = [];


    for (const freeCol of freeColumns) {

        const vector = Array(cols).fill(0);

        // free variable = 1
        vector[freeCol] = 1;


        // solve pivot variables
        for (let row = 0; row < pivotColumns.length; row++) {

            const pivotCol = pivotColumns[row];

            vector[pivotCol] = -R[row][freeCol];
        }


        basisVectors.push(vector);
    }


    return basisVectors;
}



export function analyzeMatrix(A: number[][]) {

    const reduced = rref(A);

    const rank = rankFromRREF(reduced);

    const pivotColumns = findPivotColumns(reduced);


    return {

        rref: reduced,

        rank,

        pivotColumns,

        basis: getBasis(
            A,
            pivotColumns
        ),

        nullSpace: getNullSpace(
            reduced
        ),

        isLinearlyIndependent:
            rank === A[0].length
    };
}