import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import SelectedBox from './tools/SelectedBox'
import { PathEditorConnected } from './tools/PathEditor';

type EditorsProps = {
    svgRoot: SVGSVGElement
}

type EditorsPropsFromState = {
    editMode: SvgEditMode
}

type EditorsFullProps = EditorsProps & EditorsPropsFromState

function mapStateToProps(state: AppState, props: EditorsProps): EditorsPropsFromState {
    return {
        editMode: state.svg.editMode
    }
}

class Editors extends Component<EditorsFullProps> {
    constructor(props) {
        super(props)
    }

    render() {
        switch (this.props.editMode) {
            case 'select':
                return (<SelectedBox svgRoot={this.props.svgRoot} />)
            case 'path-creating':
            case "path-editing":
                return (<PathEditorConnected svgRoot={this.props.svgRoot} />)
            default:
                return null
        }
    }

}

export default connect(mapStateToProps)(Editors)