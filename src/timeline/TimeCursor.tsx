import { Component, RefObject } from 'react'
import * as React from 'react'
import './TimeCursor.less'
import { pixelPerSecond, alignGraduations } from './Constants'

declare global {
    interface TimeCursorState {
        mousedown: boolean
    }
    interface TimeCursorProps {
        time: number
        onMoveTo: (number) => void
        onMove: (number) => void
        totalTime: number
        scale: number
        timelineMarginLeft: number
        scrollLeft: number
        alignGraduations: boolean
    }
}

export default class TimeCursor extends Component<TimeCursorProps> {
    mousedown: boolean
    startX: number
    startTime: number
    constructor(props) {
        super(props)
    }

    onMouseDown = (event) => {
        if (!this.mousedown) {
            this.mousedown = true
            this.startX = event.clientX
            this.startTime = this.props.time
            window.addEventListener('mousemove', this.onMouseMove)
            window.addEventListener('mouseup', this.onMouseUp)
        }
    }

    getMoveTime(event) {
        let position = event.clientX - this.startX
        let time = this.startTime + (position / pixelPerSecond(this.props.scale))
        time = Math.max(0, Math.min(time, this.props.totalTime))
        if (this.props.alignGraduations) {
            time = alignGraduations(time, this.props.scale)
        }
        return time
    }

    onMouseMove = (event) => {
        if (this.mousedown) {
            this.props.onMove(this.getMoveTime(event))
        }
    }

    onMouseUp = (event) => {
        if (this.mousedown) {
            this.mousedown = false
            this.props.onMoveTo(this.getMoveTime(event))
            this.componentWillUnmount()
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
    }

    render() {
        return (
            <div className="time-cursor" onMouseDown={this.onMouseDown} style={{ left: this.props.time * pixelPerSecond(this.props.scale) + this.props.timelineMarginLeft - this.props.scrollLeft }} >
                <div className={"overlay " + (this.mousedown ? "visible" : "")}></div>
                <div className="cursor"></div>
            </div>
        )
    }
}