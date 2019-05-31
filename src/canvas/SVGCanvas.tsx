import { Component, RefObject } from 'react'
import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { SizedComponent } from '../utils/SizedComponent'
import { SortedMap } from '../utils/SortedMap'
import { Map } from 'immutable'
import { TweenMax } from 'gsap/umd/TweenMax'
import { SvgEditorContext } from '../app/SvgEditorContext';

declare global {
    type SvgCanvasStateProps = {
        svgStates: Map<string, SortedMap<any>>
        currentTime: number
    }
    type SvgCanvasProps = SvgCanvasStateProps & {
        width?: number
        height?: number
    }
}


function mapStateToProps(state: AppState): SvgCanvasStateProps {
    return {
        svgStates: state.svg.svgStates,
        currentTime: state.svg.currentTime
    }
}

function setInitGsTransform(elm) {
    TweenMax.fromTo(elm, 1, {x:0},{x:100}).pause()
}

class SvgCanvas extends Component<SvgCanvasProps> {
    svgRoot: RefObject<SVGSVGElement>
    props: SvgCanvasProps
    static contextType = SvgEditorContext
    context: SvgEditorContextType
    constructor(props) {
        super(props);
        this.svgRoot = React.createRef();
    }

    updateSvgElements(oldSvgStates, newSvgStates) {
        oldSvgStates.forEach((v, id) => {
            if (newSvgStates.get(id) === undefined) {
                let toRemove = document.getElementById(id);
                toRemove.remove();
            }
        });
        newSvgStates.forEach((svgState, id) => {
            if (oldSvgStates.get(id) === undefined) {
                let keys = svgState.keys()
                let initState = svgState.get(keys[0]);
                let svg = document.createElementNS("http://www.w3.org/2000/svg", initState.nodeName)
                let initAttributes = initState.attributes
                for (let attr in initAttributes) {
                    svg.setAttribute(attr, initAttributes[attr])
                }
                this.svgRoot.current.appendChild(svg);
                setInitGsTransform(svg)
            }
        })
    }

    componentDidMount() {
        this.updateSvgElements(Map(), this.props.svgStates)
        this.context.svgCreatedSignal.next(this.svgRoot.current);
    }

    shouldComponentUpdate(nextProps: SvgCanvasProps, nextState) {
        let oldProps = this.props;
        if (oldProps.svgStates != nextProps.svgStates) {
            this.updateSvgElements(oldProps.svgStates, nextProps.svgStates);
        }
        return oldProps.width !== nextProps.width || oldProps.height !== nextProps.height;
    }

    render() {
        return (<svg ref={this.svgRoot} style={{ position: 'absolute' }} width={this.props.width + 'px'} height={this.props.height + 'px'} xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>)
    }
}


export default compose(SizedComponent, connect(mapStateToProps))(SvgCanvas);