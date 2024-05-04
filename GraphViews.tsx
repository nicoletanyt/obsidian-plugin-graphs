import * as React from "react";
import { useEffect, useState } from "react";
import functionPlot from "function-plot";

interface GraphProps {
	input: string;
	vectorArray?: number[];
}

function Graph({ input, vectorArray }: GraphProps) {

	useEffect(() => {
		console.log("Input: " + input);

		if (input.includes("vec")) {
            if (vectorArray && vectorArray.length > 0) {
                functionPlot({
                    target: "#graph",
                    xAxis: { domain: [-3, 8] },
                    grid: true,
                    data: [
                        {
                            vector: [vectorArray[0], vectorArray[1]],
                            offset: [0, 0],
                            graphType: "polyline",
                            fnType: "vector",
                        },
                    ],
                });
            }
		} else if (input.includes("x")){
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
					},
				],
			});
		} else {
            console.log("Undefined Type")
        }
	}, [input]);

	return <div id="graph"></div>;
}

interface GraphWrapperProps {
	functionInput: string;
}

enum GraphType {
	Vector = "VECTOR",
	Graph = "GRAPH",
    NULL = "NULL"
}

const GraphWrapper: React.FC<GraphWrapperProps> = ({ functionInput }) => {
	const [vector, setVector] = useState<number[]>([]);
	const [type, setType] = useState<GraphType>(GraphType.NULL);

	useEffect(() => {
		console.log("Function Input: " + functionInput);

        if (functionInput.includes("vec")) {
            setType(GraphType.Vector);
        } else if (functionInput == "") {
            setType(GraphType.NULL)
        } else {
            setType(GraphType.Graph);
        }

		if (functionInput.includes("vec")) {
			// EXAMPLE: \vec{AB} = \begin{pmatrix} 1 \\ 2 \end{pmatrix}
			let column = functionInput
				.split("\\begin{pmatrix}")[1]
				.replace("\\end{pmatrix}", "")
				.replace(/\s+/g, "");
			// COLUMN SHOULD BE SOMETHING LIKE "1 \\ 2 \"
			let rawVector = column.split("\\");
			let vectorParsed = [];

			for (let i = 0; i < rawVector.length; ++i) {
				if (rawVector[i] != "") vectorParsed.push(Number(rawVector[i]));
			}
			setVector(vectorParsed);
		} 

	}, [functionInput]);

	function getAnswer() {
		const textInput = (document.getElementById("x-val") as HTMLInputElement)
			.value;
		const datum = {
			fn: functionInput,
		};
		const scope = {
			x: Number(textInput),
		};
		const y = functionPlot.$eval.builtIn(datum, "fn", scope);
		const yText = document.getElementById("y-res");
		if (yText) yText.innerText = "y = " + y.toString();
	}

	return functionInput ? (
		<div>
			<h1>Graph of {functionInput}</h1>
			{type == "GRAPH" ? (
				<Graph input={functionInput}/>
			) : type == "VECTOR" && vector.length > 0 ? (
				<Graph input={functionInput} vectorArray={vector}/>
			) : (
				<p>Loading...</p>
			)}
			{type == "GRAPH" ? (
				<>
					<h2>Input the value of x: </h2>
					<input id="x-val" type="text" />
					<button onClick={getAnswer}>Enter</button>
					<h2 id="y-res"></h2>
				</>
			) : null}
		</div>
	) : (
		<div>
			<h1>No function entered.</h1>
		</div>
	);
};

export default GraphWrapper;
