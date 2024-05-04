import * as React from "react";
import { useEffect } from "react";
import functionPlot from "function-plot";

interface GraphProps {
	input: string;
}

function Graph({ input }: GraphProps) {
	useEffect(() => {
		console.log("Input: " + input);
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
	}, [input]);

	return <div id="graph"></div>;
}

interface GraphWrapperProps {
	functionInput: string;
}

const GraphWrapper: React.FC<GraphWrapperProps> = ({ functionInput }) => {
	useEffect(() => {
		console.log("Function Input: " + functionInput);
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
		console.log(y);
	}

	return functionInput ? (
		<div>
			<h1>Graph of {functionInput}</h1>
			<Graph input={functionInput} />
			<h2>Input the value of x: </h2>
			<input id="x-val" type="text" />
			<button onClick={getAnswer}>Enter</button>
			<h2 id="y-res"></h2>
		</div>
	) : (
		<div>
			<h1>Use the command to generate a graph.</h1>
		</div>
	);
};

export default GraphWrapper;
