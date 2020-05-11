import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import SelectedBox from './tools/SelectedBox'
import { PathEditorConnected } from './tools/PathEditor';
import { WithSvgEditorContext } from '../app/SvgEditorContext';
import { EditorToolContextType, EditorToolContext } from './EditorToolContext'

type EditorsProps = {
    svgRoot: SVGSVGElement
}

type EditorsFullProps = EditorsProps & SvgEditorContextComponentProps

class Editors extends Component<EditorsFullProps> {
    constructor(props) {
        super(props)
    }

    editorToolContext: EditorToolContextType = {
        eventLocked: false
    }

    renderTool() {
        switch (this.props.editorContext.editMode) {
            case 'select':
                return (<SelectedBox svgRoot={this.props.svgRoot} />)
            case 'path-creating':
            case "path-editing":
                return (<PathEditorConnected svgRoot={this.props.svgRoot} />)
            default:
                return null
        }
    }

    render() {
        return <EditorToolContext.Provider value={this.editorToolContext}>
            {this.renderTool()}
        </EditorToolContext.Provider>
    }

}

export default WithSvgEditorContext(Editors)