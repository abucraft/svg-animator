import * as React from 'react'
import { Component } from 'react'
import { Tooltip } from 'antd'
import "./FrameHolder.less"
import { ConnectSvgEditorContext } from '../app/SvgEditorContext'

type FrameHolderProps = {
    attribute: string
    start: number
    end: number
    totalTime: number
    scale: number
    frame: SvgAnimationFrame
} & FrameHolderPropsFromContext

type FrameHolderPropsFromContext = {
    selectedFrame: SelectedSvgAnimationFrame
    onSelectAnimationFrame: (frame: SelectedSvgAnimationFrame) => void
}

function mapContext(editorContext: SvgEditorContextType): FrameHolderPropsFromContext {
    return {
        selectedFrame: editorContext.selectedFrame,
        onSelectAnimationFrame: editorContext.onSelectAnimationFrame
    }
}
class FrameHolder extends React.PureComponent<FrameHolderProps> {
    constructor(props) {
        super(props)
    }

    render() {
        let left = this.props.start / this.props.totalTime
        let right = this.props.end / this.props.totalTime
        let width = right - left
        return <div className="frame-holder" style={{ left: `${left * 100}%`, width: `${width * 100}%` }}>
            <div className="left handle"></div>
            <div className="right handle"></div>
        </div>
    }
}

export default ConnectSvgEditorContext(mapContext)(FrameHolder)