
# Obsidian Graph & Vector Plot Plugin

This plugin integrates [FunctionPlot](https://mauriciopoppe.github.io/function-plot/) to use LaTeX to plot multiple graphs or vectors in Obsidian for better visualisation in Math and Physics concepts


## Generating Graph 

1. Select a LaTeX equation (with or without the $ is fine)
2. Use the command "Generate Graph" to generate the graph 
3. A new page will be opened with the function to plot, the graph, a function to calculate the value of y of the function given its x value, and colour coding of the graphs

- Demo: 
![[demo_images/graph_demo.png]]

## Drawing Vectors

1. Select a LaTeX equation of a vector (with or without the $ is fine)
	- If you are unsure on how to write vectors in LaTeX, this [link](https://www.quora.com/How-do-I-write-vectors-and-matrices-in-LaTeX) may be helpful
	- E.g. \vec{AB} = \begin{pmatrix} 1 \\ 2 \end{pmatrix}
	- Note: There has to be a \vec, \overrightarrow would not work here 
2. Use the command "Draw Vector" to generate the vector graph 
3. A new page will be opened with the equation, the graph, a function to add two vectors and generate the resultant vector, and colour coding of the vectors

- Demo: 
![[demo_images/vector_demo.png]]

- Demo of addition vector:
![[demo_images/addition_vector_demo.png]]


## Multiple Graphs/Vectors

- To generate multiple graphs or vectors, add "\newline" in between the functions in the LaTeX equation.  

## Options 

In the settings, you may change the 

- x & y axis labels
- title
- width & height
- grid visibility 
- ability to zoom 
