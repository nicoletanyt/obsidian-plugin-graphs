import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf, Component, getIconIds } from 'obsidian';
import * as React from 'react';
import GraphWrapper from './GraphViews';
import { Root, createRoot } from "react-dom/client";

interface GraphPlotPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: GraphPlotPluginSettings = {
	mySetting: 'default'
}

const VIEW_TYPE = "graph-view";

class GraphView extends ItemView {
	root: Root | null = null;
	functionInput: string

	constructor(leaf: WorkspaceLeaf, functionInput: string) {
		super(leaf);
		this.functionInput = functionInput
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
		const domNode = React.createElement(GraphWrapper, { functionInput: this.functionInput })

		this.root.render(domNode)
	}

	updateView() {
		console.log("Updating Root")
		const domNode = React.createElement(GraphWrapper, { functionInput: this.functionInput })

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
			(leaf) => new GraphView(leaf, "")
		);
		
		this.addCommand({
			id: 'generate-graph',
			name: 'Generate Graph',
			editorCallback: (editor: Editor, view: MarkdownView) => {

				let input = editor.getSelection();
				
				// remove $ in case it was accidentally copied 
				input = input.replace(/\$/g, '')
				console.log(input)

				this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
					if (leaf.view instanceof GraphView) {
					  // Access your view instance.
						leaf.view.functionInput = input
						leaf.view.updateView()
						leaf.view.load()
					}
				  });
		
				new Notice('Generating Graph');
				
				this.activateView()
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

		// TODO: settings for changing domains, axes labels

		// new Setting(containerEl)
		// 	.setName('Setting #1')
		// 	.setDesc('It\'s a secret')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your secret')
		// 		.setValue(this.plugin.settings.mySetting)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.mySetting = value;
		// 			await this.plugin.saveSettings();
		// 		}));
	}
}
