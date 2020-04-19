import { Component } from 'react'
import * as React from 'react'
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { editSvgText } from '../core/Actions'
import { SizedComponent } from '../utils/SizedComponent'

function mapStateToProps(state: AppState, ownProps) {
    return {
        svgText: state.svg.currentSvgText,
        ...ownProps
    }
}

declare global {
    interface SvgTextEditorProps {
        height?: number
        width?: number
        onChangeText: (value: string) => void
        svgText: string
    }
}

class SvgTextEditor extends Component {
    props: SvgTextEditorProps
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <pre style={{ position: 'absolute', height: '100%', width: '100%' }} >
                {this.props.svgText}
            </pre>
        )
    }
}



export default compose(SizedComponent, connect(mapStateToProps))(SvgTextEditor);