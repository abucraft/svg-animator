import { Component, ComponentClass, RefObject } from 'react'
import * as React from 'react'
import { ConnectedSelector, SelectorName } from './Selector'
import './ToolBar.less'
import { SvgEditorContext } from '../app/SvgEditorContext';
import { OrderedMap } from 'immutable';
import Editors from './Editors'
import { RectCreatorName, ConnectedRectCreator } from './RectCreator';
import { Subscription } from 'rxjs';

declare global {
    interface ToolBarState {
        svgRoot: SVGSVGElement
        activeToolName: string
        tools: OrderedMap<string, ComponentClass<ToolBaseProps>>
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
            tools: OrderedMap({
                [SelectorName]: ConnectedSelector,
                [RectCreatorName]: ConnectedRectCreator
            })
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

    render() {
        return (
            this.state.svgRoot && <div className="tool-bar" style={{ paddingTop: "70px", alignSelf: "stretch", display: "flex", flexDirection: 'column' }}>
                {this.state.tools.map((Tool, name) =>
                    <Tool key={name} svgRoot={this.state.svgRoot} active={this.isToolActive(name)} onSelect={this.onToolSelect} />).valueSeq().toArray()}
                <Editors svgRoot={this.state.svgRoot} />
            </div>
        )
    }
}