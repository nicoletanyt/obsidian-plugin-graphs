import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf, Component, getIconIds } from 'obsidian';
import * as React from 'react';
import GraphWrapper from './GraphViews';
import { Root, createRoot } from "react-dom/client";

export interface GraphPlotPluginSettings {
	xLabel: string,
	yLabel: string,
	disableZoom: boolean,
	grid: boolean,
	width: string, // typecast to number later
	height: string, // typecast to number later
	title: string,
}

const DEFAULT_SETTINGS: GraphPlotPluginSettings = {
	xLabel: "",
	yLabel: "",
	disableZoom: false,
	grid: true,
	width: "800",
	height: "560", 
	title: "",
}

const VIEW_TYPE = "graph-view";

class GraphView extends ItemView {
	root: Root | null = null;
	functionInput: string[]
	type: string
	settings: GraphPlotPluginSettings

	constructor(leaf: WorkspaceLeaf, functionInput: [string], type: string, settings: GraphPlotPluginSettings) {
		super(leaf);
		this.functionInput = functionInput
		this.type = type
		this.settings = settings
	}
  
	getViewType(): string {
	  return VIEW_TYPE;
	}
  
	getDisplayText(): string {
	  return "Graph View";
	}
  
	getIcon(): string {
	  return "area-chart";
	}
  
	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		const domNode = React.createElement(GraphWrapper, { functionInput: this.functionInput, type: this.type, settings: this.settings })

		this.root.render(domNode)
	}

	updateView() {
		console.log("Updating Root")
		const domNode = React.createElement(GraphWrapper, { functionInput: this.functionInput, type: this.type, settings: this.settings })

		if (this.root) this.root.render(domNode)
	}

  }

export default class GraphPlotPlugin extends Plugin {
	settings: GraphPlotPluginSettings;

	async onload() {
		await this.loadSettings();

		// Registers the view 
		this.registerView(
			VIEW_TYPE,
			(leaf) => new GraphView(leaf, [""], "", this.settings)
		);
		
		this.addCommand({
			id: 'generate-graph',
			name: 'Generate Graph',
			editorCallback: (editor: Editor, view: MarkdownView) => {

				let input = editor.getSelection();
				
				// remove $ in case it was accidentally copied 
				input = input.replace(/\$/g, '')
				console.log(input)

				const lines = input.split("\\newline")
				console.log(lines)

				this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
					if (leaf.view instanceof GraphView) {
					  // Access your view instance.
						leaf.view.functionInput = lines
						leaf.view.type = "GRAPH"
						leaf.view.updateView()
						leaf.view.load()
					}
				  });
		
				new Notice('Generating Graph');
				
				this.activateView()
			}
		});

		this.addCommand({
			id: 'draw-vector',
			name: 'Draw Vector',
			editorCallback: (editor: Editor, view: MarkdownView) => {

				let input = editor.getSelection();
				
				// remove $ in case it was accidentally copied 
				input = input.replace(/\$/g, '')
				console.log(input)

				const lines = input.split("\\newline")
				console.log(lines)

				// error handling 
				if (input.contains("\\vec")) {
					this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
						if (leaf.view instanceof GraphView) {
						  // Access your view instance.
							leaf.view.functionInput = lines
							leaf.view.type = "VECTOR"
							leaf.view.updateView()
							leaf.view.load()
						}
					  });
			
					new Notice('Drawing Vectors...');
					
					this.activateView()
				} else {
					new Notice("Invalid Syntax")
				}

			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	async activateView() {
		const { workspace } = this.app;
	
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE);
		if (leaves.length > 0) {
		  // A leaf with our view already exists, use that
		  leaf = leaves[0];

		} else {
		  // Our view could not be found in the workspace, create a new leaf in the right sidebar for it
		  leaf = workspace.getMostRecentLeaf()
		  if (leaf != null) await leaf.setViewState({ type: VIEW_TYPE, active: true });
		}
	
		// Reveal the leaf in case it is in a collapsed sidebar
		if (leaf != null) workspace.revealLeaf(leaf);
	  }

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: GraphPlotPlugin;

	constructor(app: App, plugin: GraphPlotPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("X Axis")
			.setDesc("Label for X Axis")
			.addText(text => text
				.setPlaceholder('Enter the x-axis label')
				.setValue(this.plugin.settings.xLabel)
				.onChange(async (value) => {
					this.plugin.settings.xLabel = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName("Y Axis")
			.setDesc("Label for Y Axis")
			.addText(text => text
				.setPlaceholder("Enter the y-axis label")
				.setValue(this.plugin.settings.yLabel)
				.onChange(async (value) => {
					this.plugin.settings.yLabel = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName("Disable Zoom")
			.setDesc("Enable to disable translation/scaling on the graph")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.disableZoom)
				.onChange(async (value) => {
					this.plugin.settings.disableZoom = value;
					await this.plugin.saveSettings();
				})
			)
		
		new Setting(containerEl)
			.setName("Grid")
			.setDesc("Enable to show the grid.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.grid)
				.onChange(async (value) => {
					this.plugin.settings.grid = value;
					await this.plugin.saveSettings();
				})
			)
		
		new Setting(containerEl)
			.setName("Width")
			.setDesc("Set the width of the graph.")
			.addText(text => text
				.setValue(this.plugin.settings.width)
				.onChange(async (value) => {
					this.plugin.settings.width = value;
					await this.plugin.saveSettings();
				})
			)
		
		new Setting(containerEl)
			.setName("Height")
			.setDesc("Set the height of the graph.")
			.addText(text => text
				.setValue(this.plugin.settings.height)
				.onChange(async (value) => {
					this.plugin.settings.height = value;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName("Title")
			.setDesc("Set the title of the graph.")
			.addText(text => text
				.setValue(this.plugin.settings.title)
				.onChange(async (value) => {
					this.plugin.settings.title = value;
					await this.plugin.saveSettings();
				})
			)
	}
}
