import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import { Alert, Button } from 'antd'
import SplitPane from 'react-split-pane'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
import { clearAlert, changeEditMode, createSvgNode, deselectSvgElementAll, updateSvgAttribute, selectSvgElement, moveTimeline } from '../core/Actions'
import SvgTextEditor from "../text-editor/SVGTextEditor"
import SvgCanvas from '../canvas/SVGCanvas'
import Timelines from '../timeline/Timelines'
import ToolBar from '../editor/ToolBar'
import { BehaviorSubject, Subject } from 'rxjs';
import { SvgEditorContext } from './SvgEditorContext';
import './AppBody.less'
import Logo from './icon.svg';
import { exportToSvgString, download } from '../exports/SvgExports';
import produce from 'immer'
import AttributesPanel from '../attributes-panel/AttributesPanel'

interface AppBodyProps extends AppState {
    onClearAlert: () => void
    changeEditMode: (mode: SvgEditMode) => void
    onCreateSvgElement: (obj: SvgNode) => void
    onDeselectAll: () => void
    onUpdateSvgElement: (attributesMap: AttrUpdateMap) => void
    onSelectSvgElement: (id: string) => void
    onTimelineMoveTo: (number) => void
}

interface AppBodyState {
    editorContext: SvgEditorContextType
}

function mapStateToProps(state: AppState) {
    return state
}

function mapDispatchToProps(dispatch) {
    return {
        onClearAlert: () => {
            dispatch(clearAlert())
        },
        changeEditMode: (mode: SvgEditMode) => {
            dispatch(changeEditMode(mode))
        },
        onCreateSvgElement: (obj: SvgNode) => {
            dispatch(createSvgNode(obj))
        },
        onDeselectAll: () => {
            dispatch(deselectSvgElementAll())
        },
        onUpdateSvgElement: (attributesMap: AttrUpdateMap) => {
            dispatch(updateSvgAttribute(attributesMap))
        },
        onSelectSvgElement: (id: string) => {
            dispatch(selectSvgElement(id))
        },
        onTimelineMoveTo: (time: number) => {
            dispatch(moveTimeline(time))
        }
    }
}

class AppBody extends Component<AppBodyProps, AppBodyState> {
    constructor(props) {
        super(props)
        this.state = {
            editorContext: {
                editMode: this.props.svg.editMode,
                svgStates: this.props.svg.svgStates,
                selectedElementIds: this.props.svg.selectedElementIds,
                svgCreatedSignal: new BehaviorSubject(null),
                animationSignal: new Subject(),
                currentTime: this.props.svg.currentTime,
                totalTime: this.props.svg.totalTime,
                changeEditMode: this.props.changeEditMode,
                onCreateSvgElement: this.props.onCreateSvgElement,
                onDeselectAll: this.props.onDeselectAll,
                onUpdateSvgElement: this.props.onUpdateSvgElement,
                onSelectSvgElement: this.props.onSelectSvgElement,
                onTimelineMoveTo: this.props.onTimelineMoveTo
            }
        }
    }

    static getDerivedStateFromProps(props: AppBodyProps, state: AppBodyState) {
        var newContext = produce(state.editorContext, draft => {
            draft.editMode = props.svg.editMode
            draft.selectedElementIds = props.svg.selectedElementIds
            draft.svgStates = props.svg.svgStates
            draft.currentTime = props.svg.currentTime
            draft.totalTime = props.svg.totalTime
        })
        return {
            editorContext: newContext
        }
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
                    <Button type="primary" onClick={this.handleExport} style={{ height: "100%", borderRadius: 0 }}><FontAwesomeIcon size="lg" icon={faDownload} style={{ marginRight: 16 }} />Download</Button>
                </div>
                <div style={{ flex: 1 }}>
                    <SvgEditorContext.Provider value={this.state.editorContext}>
                        <SplitPane style={{ position: 'relative' }} split="horizontal" defaultSize={200} primary="second" minSize={0}>
                            <div className="editor">
                                <ToolBar></ToolBar>
                                <SplitPane style={{ position: 'relative', height: 'auto', alignSelf: 'stretch' }} split="vertical" defaultSize={500} minSize={0} primary="second" pane2Style={{ flexDirection: 'row' }}>
                                    <SvgCanvas wrapperClassName="svg-canvas" />
                                    <AttributesPanel />
                                </SplitPane>
                            </div>
                            <Timelines />
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