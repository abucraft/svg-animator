import * as React from 'react'
import { Component } from 'react'
import { Tooltip } from 'antd'
import "./frame-holder.less"

declare global {
    interface FrameHolderProps {
        attribute: string
        left: number
        width: number
    }
}
export default class FrameHolder extends Component<FrameHolderProps> {
    constructor(props) {
        super(props)
    }

    render() {
        return (<Tooltip title={this.props.attribute}>
            <div className="frame-holder" style={{ left: this.props.left, width: this.props.width }}></div>
        </Tooltip>)
    }
}