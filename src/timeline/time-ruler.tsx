import { Component } from 'react'
import * as React from 'react'
import TimeCursor from './time-cursor'

declare global {
    interface TimeRulerProps {
        totalTime: number
        start: number
        scale: number
        onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
        onDrag?: (dx: number) => void
    }
    interface TimeRulerState {
        totalTime: number
        start: number
        scale: number
    }
}
export default class TimeRuler extends Component<TimeRulerProps> {
    constructor(props) {
        super(props)
    }
    graduations() {
        let cursors = [];
        let i = Math.floor(this.props.start);
        while (i <= this.props.totalTime) {
            cursors.push(
                <div key={i} style={{ alignSelf: 'flex-end', width: 1, position: 'relative', left: (i - this.props.start) / this.props.totalTime * 100 * this.props.scale + '%', backgroundColor: 'grey', height: "50%" }}>
                    <span style={{ WebkitUserSelect: "none", userSelect: "none", position: 'absolute', top: '-20px', transform: 'translateX(-50%)' }}>{i + 's'}</span>
                </div>)
            i++;
        }
        return cursors
    }
    render() {
        return (
            <div style={{ flex: 1, position: "relative", display: 'flex' }} onScroll={this.props.onScroll}>
                {this.graduations()}
            </div>)
    }
}