import { Component } from 'react'
import * as React from 'react'
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { editSvgText } from '../core/Actions'
import { SizedComponent } from '../utils/SizedComponent'
import produce from 'immer'
import { Subscription } from 'rxjs'
import { WithSvgEditorContext } from '../app/SvgEditorContext'
import { getTransform, getAttributes } from '../utils/Utils'
import { AttributesItemRenderer } from './AttributesItemRenderer'

type AttributesPanelState = {
    currentSvgNodeState: SvgNode
    svgRoot: SVGSVGElement
}


const EllipseAttributeTypes: { [key: string]: AttrValueType } = {
    cx: "number",
    cy: "number",
    rx: "number",
    ry: "number",
    "stroke-width": "number",
    "stroke-color": "string",
    "fill": "string"
}

const EllipseAttributeLayout = [
    ["cx", "cy"],
    ["rx", "ry"],
    ["fill"],
    ["stroke-width"],
    ["stroke-color"]
]

const AttributesTypeMap = {
    "ellipse": EllipseAttributeTypes
}

const AttributesLayout: { [key in keyof typeof AttributesTypeMap]: string[][] } = {
    "ellipse": EllipseAttributeLayout
}


class AttributesPanel extends Component<SvgEditorContextComponentProps, AttributesPanelState> {
    svgSubscription: Subscription
    constructor(props) {
        super(props)
        this.state = {
            currentSvgNodeState: null,
            svgRoot: null
        }
    }

    static getDerivedStateFromProps(props: SvgEditorContextComponentProps, state: AttributesPanelState) {
        return produce(state, draft => {
            if (draft.svgRoot) {
                if (props.editorContext.selectedElementIds.length) {
                    let node = draft.svgRoot.getElementById(props.editorContext.selectedElementIds[0]) as SVGElement
                    draft.currentSvgNodeState = draft.currentSvgNodeState || {
                        attributes: {},
                        transform: {}
                    }
                    draft.currentSvgNodeState.nodeName = node.tagName
                    Object.assign(draft.svgRoot.transform, getTransform(node))
                    let attributes = {}
                    switch (node.tagName) {
                        case "ellipse":
                            attributes = getAttributes(node, EllipseAttributeTypes)
                            break;
                    }
                    Object.assign(draft.currentSvgNodeState.attributes, attributes)
                }
            }
        })
    }

    componentDidMount() {
        this.svgSubscription = this.props.editorContext.svgCreatedSignal.subscribe((svgRoot) => {
            this.setState({ svgRoot })
        })
    }

    componentWillUnmount() {
        this.svgSubscription.unsubscribe()
    }

    renderAttributesRenderer() {
        let nodeName = this.state.currentSvgNodeState?.nodeName
        if (Object.keys(AttributesLayout).includes(nodeName)) {
            return <AttributesItemRenderer attributeTypes={AttributesTypeMap[nodeName]} layout={AttributesLayout[nodeName]} dataSource={this.state.currentSvgNodeState.attributes} />
        } else {
            return null
        }
    }

    render() {
        return <div style={{width: "100%", height: "100%", overflow: "auto"}}>
            {this.state.currentSvgNodeState && <div>
                <h2>Attributes</h2>
                {this.renderAttributesRenderer()}
            </div>
            }
        </div>
    }
}


export default WithSvgEditorContext(AttributesPanel);