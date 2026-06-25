import{ norm, cross, dot } from "mathjs"

export function magnitude(v: number[]): number{
    return norm(v) as number;
}

export function addVectors(...vectors: number[][]): number[] {
  if (vectors.length < 2) {
    throw new Error("Need at least 2 vectors");
  }

  const len = vectors[0].length;

  if (!vectors.every(v => v.length === len)) {
    throw new Error("All vectors must have same dimension");
  }

  return vectors.reduce((acc, v) =>
    acc.map((val, i) => val + v[i])
  );
}

export function subtractVector(x: number[], y: number[]): number[]{
    if(x.length !== y.length){
        throw new Error("Vectors must have same dimenstion to substract");
    }

    return x.map((val, i)=> val - y[i]);

}

export function scalarMultiplyVector(v: number[], c: number) : number[]{
    return v.map((val)=> (c*val));
}
export function crossProduct(A: number[], B: number[]): number[] {
    if(A.length !== 3 || B.length!==3){
        throw new Error("Vectors should be in 3D for cross product")
    }
    
    return cross(A, B) as number[];

}

export function dotProduct(x: number[], y: number[]): number{
    return dot(x, y) as number;
}
