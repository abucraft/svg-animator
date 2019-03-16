import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import SelectedBox from './tools/SelectedBox'

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
            default:
                return (<SelectedBox svgRoot={this.props.svgRoot} />)
        }
    }

}

export default connect(mapStateToProps)(Editors)