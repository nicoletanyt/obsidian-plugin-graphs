import * as React from "react";
import { useEffect, useState } from "react";
import functionPlot, { FunctionPlotDatum, FunctionPlotOptions } from "function-plot";
import { Notice } from "obsidian";

interface GraphProps {
	input: string[];
	vectorArray?: number[][];
	type: string;
}

const COLORS = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "cyan", "gray"]

function Graph({ input, vectorArray, type }: GraphProps) {
	useEffect(() => {
		console.log("Input: " + input);

		if (type == "VECTOR") {
			if (vectorArray && vectorArray.length > 0) {
				console.log(vectorArray);
				let parsedData = [];
				for (let i = 0; i < vectorArray.length; ++i) {
					console.log("Vector Arrays: ");
					console.log(vectorArray[i]);
					parsedData.push({
						vector: vectorArray[i],
						offset: [0, 0],
						graphType: "polyline",
						fnType: "vector",
                        color: COLORS[i]
					});
				}
				console.log(parsedData);
				try {
					functionPlot({
						target: "#graph",
						xAxis: { domain: [-3, 8] },
						grid: true,
                        width: 800,
					    height: 550,
						data: parsedData as FunctionPlotDatum[],
					});
				} catch (error) {
					console.log(error);
					// Syntax Error
					new Notice("ERROR: Invalid Syntax");
				}
			}
		} else if (type == "GRAPH") {
			try {
				let parsedData = [];
				for (let i = 0; i < input.length; ++i) {
					parsedData.push({ fn: input[i].trim(), color: COLORS[i]});
				}

				functionPlot({
					target: "#graph",
					width: 800,
					height: 550,
					yAxis: { domain: [-1, 9] },
					grid: true,
					data: parsedData,
				});
			} catch (error) {
				console.log(error);
				// Syntax Error
				new Notice("ERROR: Invalid Syntax");
			}
		} else {
			console.log("Undefined Type");
		}
	}, [input]);

	return <div id="graph"></div>;
}

interface GraphWrapperProps {
	functionInput: string[];
	type: string;
}

const GraphWrapper: React.FC<GraphWrapperProps> = ({ functionInput, type }) => {
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
            if (rawVector[i] != "")
                vectorParsed.push(Number(rawVector[i]));
        }
        return vectorParsed
    }

	useEffect(() => {
		console.log("Function Inputs: " + functionInput);

		if (type == "VECTOR") {
			let tempVectors = [];
			for (let i = 0; i < functionInput.length; ++i) {
				// EXAMPLE: \vec{AB} = \begin{pmatrix} 1 \\ 2 \end{pmatrix}
				console.log(i + "\t" + functionInput[i]);
				
				tempVectors.push(parseVector(functionInput[i]));
			}
			setVector(tempVectors);
		}
	}, [functionInput]);

	function getAnswer() {
		const textInput = (document.getElementById("x-val") as HTMLInputElement).value;
        const selectInput = (document.getElementById("pick-functions") as HTMLInputElement).value;
		
        console.log(selectInput)
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
        const vector1 = parseVector((document.getElementById("vector-1") as HTMLInputElement).value)
        const vector2 = parseVector((document.getElementById("vector-2") as HTMLInputElement).value)
        const offset = vector1 // let position of vector 1 be offset, aka the "origin" of the vector
        let result = [vector2[0] - vector1[0], vector2[1] - vector1[1]]
        let data = []
        
        if (result[0] == 0 && result[1] == 0) {
            // zero vector
            console.log("Please select two different vectors.")
            new Notice("Please select two different vectors. ")
        } else {
            // assume they have a common point
            const resultText = document.getElementById("result-vector")
            if (resultText) resultText.innerText = "The Resultant Vector is: " + result + ". (" + COLORS[functionInput.length] + ")"

            for (let i = 0; i < functionInput.length; ++i) {
                console.log(parseVector(functionInput[i]))
                data.push({
                    vector: parseVector(functionInput[i]),
                    offset: [0, 0],
                    graphType: "polyline",
                    fnType: "vector",
                    color: COLORS[i]
                })
            }
            // push resultant vector 
            data.push({
                vector: result,
                offset: offset,
                graphType: "polyline",
                fnType: "vector",
                color: COLORS[functionInput.length]
            })
            console.log(data)

            functionPlot({
                target: "#graph",
                xAxis: { domain: [-3, 8] },
                grid: true,
                width: 800,
                height: 550,
                data: data as FunctionPlotDatum[]
            });
        }   

    }

	return functionInput ? (
		<div>
			<h1>Graph of {functionInput}</h1>
			{type == "GRAPH" ? (
				<Graph input={functionInput} type={type} />
			) : type == "VECTOR" && vector.length > 0 ? (
				<Graph input={functionInput} vectorArray={vector} type={type} />
			) : (
				<></>
			)}
			<ul>
				{functionInput.map((graph, index) => (
					<li key={index}>{graph}: {COLORS[index].toString()}</li>
				))}
			</ul>
			{type == "GRAPH" ? (
                <div>
                    <hr/>
					<h3>Pick a function to calculate. </h3>
                    <select id="pick-functions" name="functions">
                        {functionInput.map((graph, index) => (
                            <option key={index} value={graph}>{graph}</option>
                        ))}
                    </select>
                    <h3>Enter an x value. </h3>
                    <input id="x-val" type="text" />
					<button onClick={getAnswer}>Enter</button>
					<h2 id="y-res"></h2>
                </div>
			) : null}
            { type == "VECTOR" ? (
                <div>
                    <hr/>
                    <h2>Select two vectors to add up. </h2>
                    <div className="vector-container">
                        <p>Vector 1: </p>
                        <select id="vector-1" name="vector-1">
                            {functionInput.map((graph, index) => (
                                <option key={index} value={graph}>{graph}</option>
                            ))}
                        </select>
                    </div>
                    <div className="vector-container">
                        <p>Vector 2: </p>
                        <select id="vector-2" name="vector-2">
                            {functionInput.map((graph, index) => (
                                <option key={index} value={graph}>{graph}</option>
                            ))}
                        </select>
                    </div>
                    <br></br>
                    <button onClick={getAdditionVector}>Generate addition vector. </button>
                    <p id="result-vector"></p>
                </div> 
            ) : <></>
            }
		</div>
	) : (
		<div>
			<h1>No function entered.</h1>
		</div>
	);
};

export default GraphWrapper;
