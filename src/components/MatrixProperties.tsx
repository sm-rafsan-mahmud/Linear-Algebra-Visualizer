import MatrixUI from "./MatrixUI";
import VectorUI from "./VectorUI";
import type { MatrixData, VectorData } from "../lib/types";
import { analyzeMatrix } from "../utils/MatrixAnalysis";
import MatrixParser from "../utils/MatrixParser";


interface MatrixPropertiesProps {
    matrix: MatrixData;
}


export default function MatrixProperties({
    matrix
}: MatrixPropertiesProps) {


    const analysis = matrix.analysis ?? analyzeMatrix(MatrixParser(matrix.values));

    if (!analysis) {
        return (
            <div>
                No analysis available
            </div>
        );
    }


    const convertToVector = (
        values:number[],
        name:string
    ):VectorData => {

        return {
            name,
            values: values.map(String)
        };

    };


    return (

        <div
        style={{
            position:"absolute",
            top:"100%",
            left:0,

            width:350,

            background:"rgba(15,23,42,0.92)",
            backdropFilter:"blur(8px)",

            color:"white",

            padding:16,

            borderRadius:10,

            border:"1px solid #334155",

            zIndex:100,

            fontSize:14,

            maxHeight:500,
            overflowY:"auto"
        }}
        >


            <h3>
                Matrix Properties: {matrix.name}
            </h3>



            <p>
                Rank: {analysis.rank}
            </p>


            <p>
                Linearly Independent:
                {" "}
                {analysis.isLinearlyIndependent
                    ? "Yes"
                    : "No"
                }
            </p>



            <hr/>

            <h4>
                RREF
            </h4>

            <MatrixUI
                matrix={{
                    name:"RREF",
                    values:
                    analysis.rref.map(
                        row=>row.map(String)
                    )
                }}
                selectedName={null}
                setSelectedName={()=>{}}
            />



            <hr/>


            <h4>
                Basis
            </h4>


            <div
            style={{
                display:"flex",
                alignItems:"center",
                flexWrap:"wrap",
                gap:5
            }}
            >

            {"{"}

            {
            analysis.basis.map((v,i)=>(

                <div key={i}
                style={{
                    display:"flex",
                    alignItems:"center"
                }}
                >

                <VectorUI

                    vector={
                        convertToVector(
                            v,
                            `B${i+1}`
                        )
                    }

                    selectedName={null}
                    setSelectedName={()=>{}}
                />


                {
                    i !== analysis.basis.length-1
                    &&
                    <span>,</span>
                }

                </div>

            ))
            }


            {"}"}

            </div>



            <hr/>




            <h4>
                Null Space
            </h4>


            <div
            style={{
                display:"flex",
                alignItems:"center",
                flexWrap:"wrap",
                gap:5
            }}
            >

            {"{"}

            {
            analysis.nullSpace.map((v,i)=>(

                <div key={i}>

                <VectorUI

                    vector={
                        convertToVector(
                            v,
                            `N${i+1}`
                        )
                    }

                    selectedName={null}
                    setSelectedName={()=>{}}
                />

                {
                    i !== analysis.nullSpace.length-1
                    &&
                    <span>,</span>
                }

                </div>

            ))
            }

            {"}"}

            </div>


        </div>

    );
}