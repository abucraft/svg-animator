import { Component, ComponentClass, RefObject } from 'react'
import * as React from 'react'
import { ConnectedSelector, SelectorName } from './Selector'
import './ToolBar.less'
import { SvgEditorContext } from '../app/SvgEditorContext';
import Editors from './Editors'
import { RectCreatorName, ConnectedRectCreator } from './RectCreator';
import { Subscription } from 'rxjs';
import { EllipseCreatorName, ConnectedEllipseCreator } from './EllipseCreator';
import { PathCreatorName, PathCreatorConnected } from './PathCreator';

declare global {
    interface ToolBarState {
        svgRoot: SVGSVGElement
        activeToolName: string
        tools: Map<string, ComponentClass<ToolBaseProps>>
    }
}



export default class ToolBar extends Component<any, ToolBarState> {
    static contextType = SvgEditorContext
    context: SvgEditorContextType

    svgSubscription: Subscription
    constructor(props) {
        super(props)
        this.state = {
            svgRoot: null,
            activeToolName: SelectorName,
            tools: new Map<string, ComponentClass<ToolBaseProps>>([
                [SelectorName, ConnectedSelector],
                [RectCreatorName, ConnectedRectCreator],
                [EllipseCreatorName, ConnectedEllipseCreator],
                [PathCreatorName, PathCreatorConnected]
            ])
        }
    }

    componentDidMount() {
        this.svgSubscription = this.context.svgCreatedSignal.subscribe((root) => this.setState({ svgRoot: root }))
    }

    componentWillUnmount() {
        this.svgSubscription.unsubscribe()
    }

    isToolActive = (name: string) => {
        return this.state.activeToolName === name;
    }

    onToolSelect = (name: string) => {
        this.setState({ activeToolName: name })
    }

    onToolDeselect = (resetDefault: boolean) => {
        // default mode is select mode
        if (resetDefault) {
            this.setState({ activeToolName: SelectorName })
        } else {
            this.setState({ activeToolName: "" })
        }
    }

    render() {
        return (
            this.state.svgRoot && <div className="tool-bar" style={{ paddingTop: "70px", alignSelf: "stretch", display: "flex", flexDirection: 'column' }}>
                {[...this.state.tools.entries()].map(([name, Tool]) =>
                    <Tool key={name} svgRoot={this.state.svgRoot} active={this.isToolActive(name)} onSelect={this.onToolSelect} onDeselect={this.onToolDeselect} />)}
                <Editors svgRoot={this.state.svgRoot} />
            </div>
        )
    }
}