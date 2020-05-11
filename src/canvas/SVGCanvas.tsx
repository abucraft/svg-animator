import { Component, RefObject } from 'react'
import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { SizedComponent } from '../utils/SizedComponent'
import { SvgEditorContext, WithSvgEditorContext } from '../app/SvgEditorContext';
import { setTransform, SVG_XMLNS, pointsToLinePath } from '../utils/Utils';

declare global {
    type SvgCanvasProps = SvgEditorContextComponentProps & SizedComponentState
}


class SvgCanvas extends Component<SvgCanvasProps> {
    svgRoot: RefObject<SVGSVGElement>
    props: SvgCanvasProps
    constructor(props) {
        super(props);
        this.svgRoot = React.createRef();
    }

    updateSvgElements(oldSvgStates: SvgStateMap, newSvgStates: SvgStateMap) {
        console.log("update svg element")
        oldSvgStates.forEach((v, id) => {
            if (newSvgStates.get(id) === undefined) {
                let toRemove = document.getElementById(id);
                toRemove.remove();
            }
        });
        newSvgStates.forEach((svgState, id) => {
            if (oldSvgStates.get(id) === undefined) {
                let keys = [...svgState.keys()]
                keys.sort((v1, v2) => v1 - v2)
                let initState = svgState.get(keys[0]);
                let svg = document.createElementNS(SVG_XMLNS, initState.nodeName)
                let initAttributes = initState.attributes
                this.updateSvgAttributes(svg, initAttributes)
                this.svgRoot.current.appendChild(svg);
                setTransform(svg, initState.transform)
            }
            else if (oldSvgStates.get(id) !== svgState) {
                // check init svg state
                let keys = [...svgState.keys()]
                keys.sort((v1, v2) => v1 - v2)
                let initState = svgState.get(keys[0]);
                let oldSvgState = oldSvgStates.get(id)
                let oldKeys = [...oldSvgState.keys()]
                oldKeys.sort((v1, v2) => v1 - v2)
                let oldInitState = oldSvgState.get(oldKeys[0])
                if (initState !== oldInitState) {
                    let svg = this.svgRoot.current.getElementById(id)
                    this.updateSvgAttributes(svg as SVGElement, initState.attributes)
                }
            }
        })
    }

    updateSvgAttributes = (svg: SVGElement, initAttributes: { [key: string]: any }) => {
        for (let attr in initAttributes) {
            let attrValue = initAttributes[attr]
            if (attr === "d") {
                attrValue = pointsToLinePath(attrValue)
            }
            svg.setAttribute(attr, attrValue)
        }
    }

    componentDidMount() {
        this.updateSvgElements(new Map(), this.props.editorContext.svgStates)
        this.props.editorContext.svgCreatedSignal.next(this.svgRoot.current);
    }

    shouldComponentUpdate(nextProps: SvgCanvasProps, nextState) {
        let oldProps = this.props;
        if (oldProps.editorContext.svgStates != nextProps.editorContext.svgStates) {
            this.updateSvgElements(oldProps.editorContext.svgStates, nextProps.editorContext.svgStates);
        }
        return oldProps.width !== nextProps.width || oldProps.height !== nextProps.height;
    }

    render() {
        return (<svg ref={this.svgRoot} style={{ position: 'absolute' }} width={this.props.width + 'px'} height={this.props.height + 'px'} xmlns={SVG_XMLNS} version="1.1"></svg>)
    }
}

export default SizedComponent(WithSvgEditorContext(SvgCanvas))