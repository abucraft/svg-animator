import { Component, RefObject } from 'react'
import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { SizedComponent } from '../utils/sized-component'
import { SortedMap } from '../utils/sorted-map'
import { Map } from 'immutable'
import { SVGRendered } from '../core/store'

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

class SvgCanvas extends Component<SvgCanvasProps> {
    svgRoot: RefObject<SVGSVGElement>
    props: SvgCanvasProps
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
                this.svgRoot.current.appendChild(svg)
            }
        })
    }

    componentDidMount() {
        this.updateSvgElements(Map(), this.props.svgStates)
        SVGRendered.next(this.svgRoot.current);
    }

    shouldComponentUpdate(nextProps: SvgCanvasProps, nextState) {
        let oldProps = this.props;
        if (oldProps.svgStates != nextProps.svgStates) {
            this.updateSvgElements(oldProps.svgStates, nextProps.svgStates);
        }
        return true;
    }

    render() {
        return (<svg ref={this.svgRoot} style={{ position: 'absolute' }} width={this.props.width + 'px'} height={this.props.height + 'px'} xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>)
    }
}


export default compose(SizedComponent, connect(mapStateToProps))(SvgCanvas);