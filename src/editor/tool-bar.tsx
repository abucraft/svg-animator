import { Component, ComponentClass, RefObject } from 'react'
import * as React from 'react'
import { Selector, ConnectedSelector } from './selector'
import './tool-bar.scss'
import { SVGRendered } from '../core/store';

declare global {
    interface ToolBarState {
        svgRoot: SVGSVGElement
        activeTool: any
        tools: [
            {
                connected: ComponentClass<ToolBaseProps>,
                raw: ComponentClass<ToolBaseProps>
            }
        ]
    }
}



export default class ToolBar extends Component<any, ToolBarState> {
    constructor(props) {
        super(props)
        this.state = {
            svgRoot: null,
            activeTool: Selector,
            tools: [{
                connected: ConnectedSelector,
                raw: Selector
            }]
        }
    }

    componentDidMount() {
        SVGRendered.subscribe((root) => this.setState({ svgRoot: root }))
    }

    isToolActive = (tool) => {
        return this.state.activeTool === tool;
    }

    onToolSelect = (tool) => {
        this.setState({ activeTool: tool })
    }

    registTool = (tool) => {

    }

    render() {
        return (
            this.state.svgRoot && <div className="tool-bar" style={{ paddingTop: "70px", alignSelf: "stretch", display: "flex", flexDirection: 'column' }}>
                {this.state.tools.map((tool) =>
                    <tool.connected key={tool.connected.name} svgRoot={this.state.svgRoot} active={this.isToolActive(tool.raw)} onSelect={this.onToolSelect} />)}
            </div>
        )
    }
}