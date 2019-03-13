import { Component } from 'react'
import * as React from 'react'
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import AceEditor from 'react-ace'
import * as brace from 'brace'
import 'brace/mode/svg'
import 'brace/theme/github'
import { editSvgText } from '../core/Actions'
import { SizedComponent } from '../utils/SizedComponent'

function mapStateToProps(state: AppState, ownProps) {
    return {
        svgText: state.svg.currentSvgText,
        ...ownProps
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChangeText: (text) => {
            dispatch(editSvgText(text));
        }
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
    componentDidMount() {

    }
    componentWillUnmount() {

    }
    render() {
        return (
            <div style={{ position: 'absolute', height: '100%', width: '100%' }} >
                <AceEditor mode="svg"
                    theme="github"
                    name="SVG_EDITOR"
                    width={this.props.width + 'px'}
                    height={this.props.height + 'px'}
                    onChange={this.props.onChangeText}
                    fontSize={16}
                    value={this.props.svgText}
                    editorProps={{ $blockScrolling: true }} />
            </div>
        )
    }
}



export default compose(SizedComponent, connect(mapStateToProps, mapDispatchToProps))(SvgTextEditor);