import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import { Alert, Icon, Button } from 'antd'
import SplitPane from 'react-split-pane'
import { clearAlert } from '../core/Actions'
import SvgTextEditor from "../text-editor/SVGTextEditor"
import SvgCanvas from '../canvas/SVGCanvas'
import Timelines from '../timeline/Timelines'
import ToolBar from '../editor/ToolBar'
import { BehaviorSubject, Subject } from 'rxjs';
import { SvgEditorContext } from './SvgEditorContext';
import './AppBody.less'
import Logo from './icon.svg';
import { exportToSvgString, download } from '../exports/SvgExports';

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
    svgEditorContextValue: SvgEditorContextType = {
        svgCreatedSignal: new BehaviorSubject(null),
        animationSignal: new Subject(),
        eventLocked: false
    }

    constructor(props) {
        super(props)
    }

    handleExport = () => {
        let svgStr = exportToSvgString(this.props.svg.svgStates)
        download(svgStr, "test.svg")
    }

    render() {
        return (
            <div className="app">
                <div className="header">
                    <div className="logo-name" style={{ marginLeft: 8 }}>
                        <Logo width="25" height="25" viewBox="0 0 640 640" style={{ marginTop: "auto", marginBottom: "auto" }} />
                        <h3 style={{ marginLeft: "16px" }}>SVG Animator</h3>
                    </div>
                    <Button type="primary" onClick={this.handleExport} style={{ height: "100%", borderRadius: 0 }}><Icon type="download" />Download</Button>
                </div>
                <div style={{ flex: 1 }}>
                    <SvgEditorContext.Provider value={this.svgEditorContextValue}>
                        <SplitPane style={{ position: 'relative' }} split="horizontal" defaultSize={200} primary="second">
                            <div className="editor">
                                <ToolBar></ToolBar>
                                <SplitPane style={{ position: 'relative', height: 'auto', alignSelf: 'stretch' }} split="vertical" defaultSize={500} primary="second" pane2Style={{ flexDirection: 'row' }}>
                                    <SvgCanvas className="svg-canvas" />
                                    <SvgTextEditor style={{ flex: 1, width: 0 }} />
                                </SplitPane>
                            </div>
                            <Timelines style={{ height: "100%" }} />
                        </SplitPane>
                    </SvgEditorContext.Provider>
                </div>
                <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
                    {this.props.alert.alertType && <Alert banner type={this.props.alert.alertType} message={this.props.alert.message} closable onClose={this.props.onClearAlert} />}
                </div>
            </div >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBody)