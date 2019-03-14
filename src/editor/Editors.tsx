import { Component, RefObject } from 'react'
import * as React from 'react'
import { compose } from 'redux'
import { connect, Dispatch } from 'react-redux'
import { SortedMap } from '../utils/SortedMap'
import { Map } from 'immutable'
import { SVGRendered } from '../core/Store'
import { moveSvgElement } from '../core/Actions'
import SelectedBox from './SelectedBox'

declare global {
    interface EditorsProps {
        svgRoot: SVGSVGElement
    }

    interface EditorsPropsFromState {
        editMode: SvgEditMode
        svgStates: Map<string, SortedMap<SvgNode>>
        selectedElementIds: Array<string>
    }

    interface EditorsDispatchesFromState {
        onMoveSvgElement: (attributesMap: Map<string, SvgNode>) => void
    }

    type EditorsFullProps = EditorsProps & EditorsPropsFromState & EditorsDispatchesFromState
}

function mapStateToProps(state: AppState, props: EditorsProps): EditorsPropsFromState {
    return {
        editMode: state.svg.editMode,
        svgStates: state.svg.svgStates,
        selectedElementIds: state.svg.selectedElementIds
    }
}

function mapDispatchToProps(dispatch): EditorsDispatchesFromState {
    return {
        onMoveSvgElement: (attributesMap: Map<string, SvgNode>) => {
            dispatch(moveSvgElement(attributesMap));
        }
    }
}

class Editors extends Component<EditorsFullProps> {
    constructor(props) {
        super(props)
    }

    render() {
        switch (this.props.editMode) {
            case 'select':
            default:
                return (<SelectedBox svgRoot={this.props.svgRoot} selectedElementIds={this.props.selectedElementIds} onMoveSvgElement={this.props.onMoveSvgElement} />)
        }
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(Editors)