import * as math from "mathjs";
import { matrix } from "mathjs";

import type {
  MatrixData,
  VectorData,
  VariableData,
} from "../lib/types";

import MatrixParser from "./MatrixParser";
import VectorParser from "./VectorParser";
import NormalizeMatrix from "./NormalizeMatrix";
import { parseFormula, type ParsedFormula } from "./parsedFormula";

import { useMatrixStore } from "../store/matrixStore";
import { useVectorStore } from "../store/vectorStore";
import { useVariableStore } from "../store/variableStore";


function buildScope(
  matrices: MatrixData[],
  vectors: VectorData[],
  variables: VariableData[]
) {

  const scope: Record<string, any> = {};


  matrices.forEach((mat) => {

    scope[mat.name] =
      matrix(
        MatrixParser(mat.values)
      );

  });


  vectors.forEach((vec) => {

    scope[vec.name] =
      matrix(
        VectorParser(vec.values)
          .map(v => [v])
      );

  });


  variables.forEach((variable)=>{

    scope[variable.name] =
      variable.value;

  });


  return scope;
}



export type EvaluationResult =
{
  type:"matrix";
  name?:string;
  values:string[][];
}
|
{
  type:"vector";
  name?:string;
  values:string[];
}
|
{
  type:"scalar";
  name?:string;
  value:number;
};



function detectType(
  result:any
):EvaluationResult {


  if(typeof result === "number"){

    return {
      type:"scalar",
      value:result
    };

  }



  const normalized =
    NormalizeMatrix(result);



  /*
    Only 2D/3D column vectors
    become vectors
  */

  if(
    normalized.every(
      row=>row.length===1
    )
    &&
    (
      normalized.length===2 ||
      normalized.length===3
    )
  ){

    return {
      type:"vector",
      values:
        normalized.map(
          row=>row[0]
        )
    };

  }



  return {
    type:"matrix",
    values:normalized
  };

}




function evaluateExpression(
  expression:string
):EvaluationResult {


  const matrices =
    useMatrixStore
      .getState()
      .matrices;


  const vectors =
    useVectorStore
      .getState()
      .vectors;


  const variables =
    useVariableStore
      .getState()
      .variables;



  const scope =
    buildScope(
      matrices,
      vectors,
      variables
    );


  const raw =
    math.evaluate(
      expression,
      scope
    );


  return detectType(raw);

}





function saveResult(
  name:string,
  result:EvaluationResult
){

  /*
      MATRIX
  */

  if(result.type==="matrix"){


    const store =
      useMatrixStore.getState();


    const exists =
      store.matrices.find(
        m=>m.name===name
      );


    if(exists){

      store.updateMatrix(
        name,
        result.values
      );

    }
    else{

      store.addMatrix({

        name,

        values:result.values

      });

    }

  }



  /*
      VECTOR
  */

  else if(result.type==="vector"){


    const store =
      useVectorStore.getState();


    const exists =
      store.vectors.find(
        v=>v.name===name
      );


    if(exists){

      store.updateVector(
        name,
        result.values
      );

    }
    else{

      store.addVector({

        name,

        values:result.values,

        color:"#38bdf8"

      });

    }

  }



  /*
      SCALAR
  */

  else if(result.type==="scalar"){


    const store =
      useVariableStore.getState();


    const exists =
      store.variables.find(
        v=>v.name===name
      );


    if(exists){

      store.updateVariable(
        name,
        result.value
      );

    }
    else{

      store.addVariable({

        name,

        value:result.value

      });

    }

  }

}




export function evaluateFormula(
  formula:string
):EvaluationResult|null {


  try{


    const parsed =
      parseFormula(formula);



    switch(parsed.kind){



      /*
          A+B
      */

      case "compute":{

        return evaluateExpression(
          parsed.expression
        );

      }




      /*
          B=A+B
      */

      case "matrix-expression":
      case "vector-expression":
      case "variable-assign":{


        const result =
          evaluateExpression(
            parsed.expression
          );


        saveResult(
          parsed.varName,
          result
        );


        result.name =
          parsed.varName;


        return result;

      }




      default:

        return null;

    }



  }
  catch(error){

    console.error(
      "Evaluation error:",
      error
    );


    return null;

  }

}