import { Component } from 'react'
import * as React from 'react'
import produce from 'immer'
import { Subscription } from 'rxjs'
import { WithSvgEditorContext } from '../app/SvgEditorContext'
import { getTransform, getAttributes } from '../utils/Utils'
import { AttributesItemRenderer, AttributeItemLayout } from './AttributesItemRenderer'
import { EllipseAttributeTypes, RectAttributeTypes, CommonAttributeTypes } from '../core/SVGDefaultValues'

type AttributesPanelState = {
    currentSvgNodeState: SvgNode
    svgRoot: SVGSVGElement
}


const CommonAttributeLayout: AttributeItemLayout[] = [
    "fill",
    {
        label: "stroke",
        attribute: "stroke",
        children: [{
            label: null,
            attribute: "stroke-width"
        }]
    }
]

const EllipseAttributeLayout: AttributeItemLayout[] = [
    { children: ["rx", "ry"] },
    ...CommonAttributeLayout
]

const RectAttributeLayout: AttributeItemLayout[] = [
    { children: ["width", "height"] },
    ...CommonAttributeLayout
]

const AttributesTypeMap = {
    "ellipse": EllipseAttributeTypes,
    "rect": RectAttributeTypes
}

const AttributesLayoutMap: { [key in keyof typeof AttributesTypeMap]: AttributeItemLayout[] } = {
    "ellipse": EllipseAttributeLayout,
    "rect": RectAttributeLayout
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
                        case "rect":
                            attributes = getAttributes(node, AttributesTypeMap[node.tagName])
                            break;
                        default:
                            attributes = getAttributes(node, CommonAttributeTypes)

                    }
                    Object.assign(draft.currentSvgNodeState.attributes, attributes)
                } else {
                    draft.currentSvgNodeState = null
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

    onChangeAttribute = (value: any, key: string) => {
        let elm = this.state.svgRoot.getElementById(this.props.editorContext.selectedElementIds[0])
        elm.setAttribute(key, value)
        this.setState(produce(this.state, draft => {
            draft.currentSvgNodeState.attributes[key] = value
        }))
    }

    onChangeAttributeComplete = (value: any, key: string) => {
        this.props.editorContext.onUpdateSvgElement({
            [this.props.editorContext.selectedElementIds[0]]: {
                attributes: {
                    [key]: value
                }
            }
        })
    }

    renderAttributesRenderer() {
        let nodeName = this.state.currentSvgNodeState?.nodeName
        let attributeTypes = CommonAttributeTypes
        let attributeLayout = CommonAttributeLayout
        if (Object.keys(AttributesLayoutMap).includes(nodeName)) {
            attributeTypes = AttributesTypeMap[nodeName]
            attributeLayout = AttributesLayoutMap[nodeName]
        }
        return <AttributesItemRenderer
            attributeTypes={attributeTypes}
            layout={attributeLayout}
            dataSource={this.state.currentSvgNodeState.attributes}
            onChange={this.onChangeAttribute}
            onChangeComplete={this.onChangeAttributeComplete}
        />
    }

    render() {
        return <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            {this.state.currentSvgNodeState && <div>
                <h2>Attributes</h2>
                {this.renderAttributesRenderer()}
            </div>
            }
        </div>
    }
}


export default WithSvgEditorContext(AttributesPanel);