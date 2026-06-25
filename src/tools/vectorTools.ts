import { getVector }from "./stateTools";
import VectorParser from "../utils/VectorParser";


export function getParsedVector(name: string): number[] {
  const vector = getVector(name);

  if (!vector) {
    throw new Error(`Vector "${name}" not found`);
  }

  return VectorParser(vector.values);
}


import {magnitude,
        addVectors,
        subtractVector,
        scalarMultiplyVector,
        dotProduct,
        crossProduct} from "../utils/VectorOperations";


export const vector ={
    
    add: (...names: string[]) => {
    const vectors = names.map(n =>
      getParsedVector(n)
    );

    return addVectors(...vectors);
  },
    subtract: (a: string, b: string) => {
        const A = getParsedVector(a);
        const B = getParsedVector(b);

        return subtractVector(A, B);
    },
    dot: (a: string, b: string) => {
        const A = getParsedVector(a);
        const B = getParsedVector(b);

        return dotProduct(A, B);
    },
    magnitude: (a: string) => {
        const A = getParsedVector(a);

        return magnitude(A);
    },

    scalarMultiply: (a: string, c: number) => {
        const A = getParsedVector(a);

        return scalarMultiplyVector(A, c);
    },

   cross: (a: string, b: string) =>{
    const A = getParsedVector(a);
    const B = getParsedVector(b);
    return crossProduct(A, B);
   }



}

