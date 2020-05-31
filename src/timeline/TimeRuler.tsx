import { Component } from 'react'
import * as React from 'react'
import TimeCursor from './TimeCursor'
import './TimeRuler.less';
import { SizedComponent } from '../utils/SizedComponent';
import { getTimeDivide, pixelPerSecond, MinTimelineScale, MaxTimelineScale, TimeToPixelScale, BaseTimeSeconds } from './Constants';

interface TimeRulerProps {
    totalTime: number
    scale: number
    onChange?: (scale: number, scrollLeft: number) => void
    width: number
    height: number
    timelineMarginLeft: number
    timelineMarginRight: number
    scrollLeft: number
}
class TimeRuler extends React.PureComponent<TimeRulerProps> {
    point: Point2D
    startScrollLeft = 0
    rulerRef: React.RefObject<HTMLDivElement>
    constructor(props) {
        super(props)
        this.rulerRef = React.createRef()
    }

    getTotalTimeLineMargin() {
        return this.props.timelineMarginLeft + this.props.timelineMarginRight
    }

    graduations() {
        let cursors = [];
        let timeDivide = getTimeDivide(this.props.scale)
        let pxSecond = pixelPerSecond(this.props.scale)
        let maxVisibleTime = Math.ceil((this.props.width - this.getTotalTimeLineMargin() + this.props.scrollLeft) / pxSecond)
        let start = Math.floor(this.props.scrollLeft / pxSecond)
        let gradeCount = (maxVisibleTime - start) * timeDivide

        for (let i = 0; i < gradeCount; i++) {
            let left = ((i / timeDivide + start) / BaseTimeSeconds) * 100
            let longerDivide = (timeDivide > 1 ? (i % (timeDivide / 2) === 0) : (timeDivide == 1 ? (i % 5 === 0) : (i % 6 === 0)))
            let height = longerDivide ? "50%" : "25%"
            let text = (timeDivide > 1 ? (i % timeDivide === 0 ? `${i / timeDivide + start}s` : "") : (timeDivide === 1 ? (i % 5 === 0 ? `${i + start}s` : "") : (i % 12 === 0 ? `${i / 12 + start / 12}m` : "")))
            cursors.push(
                <div key={i} style={{ alignSelf: 'flex-end', width: 0.5, position: 'absolute', left: `${left}%`, backgroundColor: 'grey', height: height }}>
                    {text && <span style={{ WebkitUserSelect: "none", userSelect: "none", position: 'absolute', top: '-20px', transform: 'translateX(-50%)' }}>{text}</span>}
                </div>
            )
        }
        return cursors
    }

    getMaxScrollLeft() {
        let pxSecond = pixelPerSecond(this.props.scale)
        let scrollWidth = this.props.totalTime * pxSecond
        return scrollWidth - (this.props.width - this.getTotalTimeLineMargin() - pxSecond)
    }

    onMouseDown = (event: React.MouseEvent) => {
        this.point = { x: event.clientX, y: event.clientY }
        this.startScrollLeft = this.props.scrollLeft
        window.addEventListener("mousemove", this.onMouseMove)
        window.addEventListener("mouseup", this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        let dx = this.point.x - event.clientX;
        let scrollChangeRight = Math.max(0, this.getMaxScrollLeft() - this.startScrollLeft)
        dx = Math.max(-this.startScrollLeft, Math.min(dx, scrollChangeRight))
        this.props.onChange && this.props.onChange(this.props.scale, this.startScrollLeft + dx)
    }

    onMouseUp = () => {
        this.removeWindowEvents()
    }

    removeWindowEvents = () => {
        window.removeEventListener("mousemove", this.onMouseMove)
        window.removeEventListener("mouseup", this.onMouseUp)
    }

    onMouseWheel = (event: React.WheelEvent) => {
        let clientX = event.clientX
        let rulerX = this.rulerRef.current.getBoundingClientRect().left
        let delta = clientX - rulerX
        let scale, scrollChange
        if (event.deltaY < 0) {
            scale = Math.max(MinTimelineScale, this.props.scale / 1.1)
            scrollChange = delta / 1.1 - delta
        } else {
            scale = Math.min(MaxTimelineScale, this.props.scale * 1.1)
            scrollChange = delta * 1.1 - delta
        }
        this.props.onChange(scale, Math.max(0, Math.min(this.getMaxScrollLeft(), this.props.scrollLeft + scrollChange)))
    }

    render() {
        return (
            <div style={{ flex: "0 0 auto", height: this.props.height, position: "relative", display: 'flex', cursor: "grab", userSelect: "none" }} onMouseDown={this.onMouseDown} onWheel={this.onMouseWheel}>
                <div ref={this.rulerRef} style={{
                    position: 'absolute',
                    height: this.props.height,
                    left: this.props.timelineMarginLeft - this.props.scrollLeft,
                    width: pixelPerSecond(this.props.scale) * BaseTimeSeconds,
                    display: "flex"
                }}>
                    <div
                        className="time-ruler-grey-out"
                        style={{
                            height: this.props.height,
                            position: "absolute",
                            width: 10000,
                            left: this.props.totalTime * pixelPerSecond(this.props.scale)
                        }}
                    >

                    </div>
                    {this.graduations()}
                </div>
            </div>)
    }
}

export default SizedComponent(TimeRuler)