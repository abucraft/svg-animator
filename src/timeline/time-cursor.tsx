import { Component, RefObject } from 'react'
import * as React from 'react'
import './time-cursor.scss'

declare global {
    interface TimeCursorState {
        position: number
        min: number
    }
    interface TimeCursorProps {
        position: number
        onMoveTo: (number) => void
        onMove: (number) => void
        min?: number
    }
}

export default class TimeCursor extends Component<TimeCursorProps, TimeCursorState> {
    cursorRef: RefObject<HTMLDivElement>
    mousedown: boolean
    startX: number
    constructor(props) {
        super(props)
        this.state = {
            position: props.position,
            min: props.min ? props.min : 0
        }
        this.cursorRef = React.createRef()
    }

    onMouseDown = (event) => {
        if (!this.mousedown) {
            this.mousedown = true
            this.startX = event.clientX
            window.addEventListener('mousemove', this.onMouseMove)
            window.addEventListener('mouseup', this.onMouseUp)
        }
    }

    onMouseMove = (event) => {
        if (this.mousedown) {
            let position = event.clientX - this.startX + this.state.position
            position = position > this.state.min ? position : this.state.min
            this.props.onMove(position)
            this.cursorRef.current.style.left = position + 'px'
        }
    }

    onMouseUp = (event) => {
        if (this.mousedown) {
            let position = event.clientX - this.startX + this.state.position
            position = position > this.state.min ? position : this.state.min
            this.cursorRef.current.style.left = position + 'px'
            this.props.onMoveTo(position)
            this.mousedown = false
            window.removeEventListener('mousemove', this.onMouseMove)
            window.removeEventListener('mouseup', this.onMouseUp)
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            position: nextProps.position,
            min: nextProps.min ? nextProps.min : 0
        }
    }

    render() {
        return (
            <div ref={this.cursorRef} className="time-cursor" onMouseDown={this.onMouseDown} style={{ left: this.state.position + 'px' }} >
                <div></div>
            </div>
        )
    }
}