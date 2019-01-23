import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import { Alert } from 'antd'
import SplitPane from 'react-split-pane'
import { clearAlert } from '../core/actions'
import SvgTextEditor from "../text-editor/svg-text-editor"
import SvgCanvas from '../canvas/svg-canvas'
import Timelines from '../timeline/timelines'
import ToolBar from '../editor/tool-bar'
import { dispatchWindowResize } from '../utils/utils'

declare global {
    interface AppBodyProps extends AppState {
        onClearAlert: () => null
    }
}

function mapStateToProps(state: AppState) {
    return state
}

function mapDispatchToProps(dispatch) {
    return {
        onClearAlert: () => {
            dispatch(clearAlert())
        }
    }
}

class AppBody extends Component<AppBodyProps> {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="app">
                <SplitPane style={{ position: 'relative' }} split="horizontal" defaultSize={200} primary="second" onChange={dispatchWindowResize} onDragFinished={dispatchWindowResize}>
                    <div className="editor">
                        <ToolBar></ToolBar>
                        <SplitPane style={{ position: 'relative', height: 'auto', alignSelf: 'stretch' }} split="vertical" defaultSize={500} primary="second" onChange={dispatchWindowResize} onDragFinished={dispatchWindowResize} pane2Style={{ flexDirection: 'row' }}>
                            <SvgCanvas className="svg-canvas" />
                            <SvgTextEditor style={{ flex: 1, width: 0 }} />
                        </SplitPane>
                    </div>
                    <Timelines style={{ height: "100%" }}/>
                </SplitPane>
                <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
                    {this.props.alert.alertType && <Alert banner type={this.props.alert.alertType} message={this.props.alert.message} closable onClose={this.props.onClearAlert} />}
                </div>
            </div >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBody)