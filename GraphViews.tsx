import * as React from "react";
import { useEffect } from "react";
import functionPlot from "function-plot";

interface GraphProps {
    input: string;
}

function Graph({ input }: GraphProps) {
    useEffect(() => {
        console.log("Input: " + input)
        functionPlot({
            target: "#graph",
            width: 800,
            height: 500,
            yAxis: { domain: [-1, 9] },
            grid: true,
            data: [
                {
                    fn: input,
                    // derivative: {
                    //     fn: "2 * x",
                    //     updateOnMouseMove: true
                    // }
                }
            ]
        });
    }, [input]);

    return <div id="graph"></div>;
}

interface GraphWrapperProps {
    functionInput: string;
}

const GraphWrapper: React.FC<GraphWrapperProps> = ({ functionInput }) => {
    useEffect(() => {
        console.log("Function Input: " + functionInput)
    }, [functionInput])
  return (
    functionInput ? 
    <div>
      <h1>Graph of {functionInput}</h1>
      <Graph input={functionInput} />
    </div>
    :
    <div>
        <h1>Use the command to generate a graph.</h1>
    </div>
  );
}

export default GraphWrapper;