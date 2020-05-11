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

interface SvgTextEditorProps {
    onChangeText: (value: string) => void
    svgText: string
}

class AttrubutesPanel extends Component<SvgTextEditorProps> {
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



export default connect(mapStateToProps)(AttrubutesPanel);