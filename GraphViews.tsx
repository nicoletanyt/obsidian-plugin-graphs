import * as React from "react";
import { useEffect, useState, useRef } from "react";
import functionPlot, {
	FunctionPlotDatum,
	FunctionPlotOptions,
} from "function-plot";
import { Notice, loadMathJax, renderMath, finishRenderMath } from "obsidian";
import { GraphPlotPluginSettings } from "main";

loadMathJax();

interface GraphProps {
	input: string[];
	vectorArray?: number[][];
	type: string;
	settings: GraphPlotPluginSettings
}

const COLORS = [
	"red",
	"green",
	"blue",
	"yellow",
	"orange",
	"purple",
	"pink",
	"cyan",
	"gray",
];

function Graph({ input, vectorArray, type, settings }: GraphProps) {
	useEffect(() => {
		if (type == "VECTOR") {
			if (vectorArray && vectorArray.length > 0) {
				let parsedData = [];
				for (let i = 0; i < vectorArray.length; ++i) {
					parsedData.push({
						vector: vectorArray[i],
						offset: [0, 0],
						graphType: "polyline",
						fnType: "vector",
						color: COLORS[i],
					});
				}
				try {
					functionPlot({
						target: "#graph",
						xAxis: { label: settings.xLabel },
						yAxis: { label: settings.yLabel },
						grid: settings.grid,
						width: Number(settings.width),
						height: Number(settings.height),
						data: parsedData as FunctionPlotDatum[],
						disableZoom: settings.disableZoom,
						title: settings.title
					});
				} catch (error) {
					// Syntax Error
					new Notice("ERROR: Invalid Syntax");
				}
			}
		} else if (type == "GRAPH") {
			try {
				let parsedData = [];
				for (let i = 0; i < input.length; ++i) {
					parsedData.push({ fn: input[i].trim(), color: COLORS[i] });
				}

				functionPlot({
					target: "#graph",
					width: Number(settings.width),
					height: Number(settings.height),
					xAxis: { label: settings.xLabel },
					yAxis: { label: settings.yLabel },
					grid: settings.grid,
					data: parsedData,
					disableZoom: settings.disableZoom,
					title: settings.title
				});
			} catch (error) {
				// Syntax Error
				new Notice("ERROR: Invalid Syntax");
			}
		} 
	}, [input]);

	return <div id="graph"></div>;
}

interface MathBlockProps {
	functionInput: string[];
}

function MathBlock({ functionInput }: MathBlockProps) {
	const containerRef = useRef<HTMLDivElement>(null);
  
	useEffect(() => {
	  if (containerRef.current) {
		while (containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild) 
		let equation = functionInput.join(", \\space")

		const element = renderMath(equation, true);
		containerRef.current.appendChild(element);
		finishRenderMath();
	  }
	}, [functionInput]);
	
	return <div ref={containerRef}></div>;
  }

interface GraphWrapperProps {
	functionInput: string[];
	type: string;
	settings: GraphPlotPluginSettings
}

const GraphWrapper: React.FC<GraphWrapperProps> = ({ functionInput, type, settings }) => {
	const [vector, setVector] = useState<number[][]>([]);

	function parseVector(func: string) {
		let column = func
			.split("\\begin{pmatrix}")[1]
			.replace("\\end{pmatrix}", "")
			.replace(/\s+/g, "");
		// COLUMN SHOULD BE SOMETHING LIKE "1 \\ 2 \"
		let rawVector = column.split("\\");
		let vectorParsed = [];

		for (let i = 0; i < rawVector.length; ++i) {
			if (rawVector[i] != "") vectorParsed.push(Number(rawVector[i]));
		}
		return vectorParsed;
	}

	useEffect(() => {
		if (type == "VECTOR") {
			let tempVectors = [];
			for (let i = 0; i < functionInput.length; ++i) {
				// EXAMPLE: \vec{AB} = \begin{pmatrix} 1 \\ 2 \end{pmatrix}
				tempVectors.push(parseVector(functionInput[i]));
			}
			setVector(tempVectors);
		}
	}, [functionInput]);

	function getAnswer() {
		const textInput = (document.getElementById("x-val") as HTMLInputElement)
			.value;
		const selectInput = (
			document.getElementById("pick-functions") as HTMLInputElement
		).value;

		const datum = {
			fn: selectInput.trim(),
		};
		const scope = {
			x: Number(textInput),
		};
		const y = functionPlot.$eval.builtIn(datum, "fn", scope);
		const yText = document.getElementById("y-res");
		if (yText) yText.innerText = "y = " + y.toString();
	}

	function getAdditionVector() {
		const vector1 = parseVector(
			(document.getElementById("vector-1") as HTMLInputElement).value
		);
		const vector2 = parseVector(
			(document.getElementById("vector-2") as HTMLInputElement).value
		);
		const offset = vector1; // let position of vector 1 be offset, aka the "origin" of the vector
		let result = [vector2[0] - vector1[0], vector2[1] - vector1[1]];
		let data = [];

		if (result[0] == 0 && result[1] == 0) {
			// zero vector
			new Notice("Please select two different vectors. ");
		} else {
			// assume they have a common point
			const resultText = document.getElementById("result-vector");
			if (resultText)
				resultText.innerText =
					"The Resultant Vector is: " +
					result +
					". (" +
					COLORS[functionInput.length] +
					")";

			for (let i = 0; i < functionInput.length; ++i) {
				data.push({
					vector: parseVector(functionInput[i]),
					offset: [0, 0],
					graphType: "polyline",
					fnType: "vector",
					color: COLORS[i],
				});
			}
			// push resultant vector
			data.push({
				vector: result,
				offset: offset,
				graphType: "polyline",
				fnType: "vector",
				color: COLORS[functionInput.length],
			});

			functionPlot({
				target: "#graph",
				grid: settings.grid,
				width: Number(settings.width),
				height: Number(settings.height),
				xAxis: { label: settings.xLabel },
				yAxis: { label: settings.yLabel },
				data: data as FunctionPlotDatum[],
				disableZoom: settings.disableZoom,
				title: settings.title
			});
		}
	}

	return functionInput ? (
		<div>
			<h1>			
				Graph of
				<MathBlock functionInput={functionInput}></MathBlock>
			</h1>

			{type == "GRAPH" ? (
				<Graph input={functionInput} type={type} settings={settings} />
			) : type == "VECTOR" && vector.length > 0 ? (
				<Graph input={functionInput} vectorArray={vector} type={type} settings={settings} />
			) : (
				<></>
			)}
			<ul>
				{functionInput.map((graph, index) => (
					<li key={index}>
						<MathBlock functionInput={[graph + ": \\text{" + COLORS[index].toString() + "}"]}/>
					</li>
				))}
			</ul>
			{type == "GRAPH" ? (
				<div>
					<hr />
					<h3>Pick a function to calculate. </h3>
					<select id="pick-functions" name="functions">
						{functionInput.map((graph, index) => (
							<option key={index} value={graph}>
								{graph}
							</option>
						))}
					</select>
					<h3>Enter an x value. </h3>
					<input id="x-val" type="text" />
					<button onClick={getAnswer}>Enter</button>
					<h2 id="y-res"></h2>
				</div>
			) : null}
			{type == "VECTOR" ? (
				<div>
					<hr />
					<h2>Select two vectors to add up. </h2>
					<div className="vector-container">
						<p>Vector 1: </p>
						<select id="vector-1" name="vector-1">
							{functionInput.map((graph, index) => (
								<option key={index} value={graph}>
									{graph.substring(graph.indexOf("{") + 1,graph.indexOf("}"))}
								</option>
							))}
						</select>
					</div>
					<div className="vector-container">
						<p>Vector 2: </p>
						<select id="vector-2" name="vector-2">
							{functionInput.map((graph, index) => (
								<option key={index} value={graph}>
								{graph.substring(graph.indexOf("{") + 1,graph.indexOf("}"))}
								</option>
							))}
						</select>
					</div>
					<br></br>
					<button onClick={getAdditionVector}>
						Generate addition vector.{" "}
					</button>
					<p id="result-vector"></p>
				</div>
			) : (
				<></>
			)}
		</div>
	) : (
		<div>
			<h1>No function entered.</h1>
		</div>
	);
};

export default GraphWrapper;
