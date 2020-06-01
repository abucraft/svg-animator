
import { Component, RefObject } from 'react'
import * as React from 'react'
import PlayStopButton from './PlayStopButton'
import FrameHolder from './FrameHolder'
import TimeRuler from './TimeRuler'
import TimeCursor from './TimeCursor'
import { CustomScrollContainer } from './CustomScrollContainer'
import { TimelineMarginLeft, TimelineMarginRight, BaseTimeSeconds, pixelPerSecond, TimeRulerHeight } from './Constants'
declare global {
    interface FrameContainerProps {
        totalTime: number
        innerTime: number
        start: number
        svgAnimations: SvgAnimations
        onTimelineMove: (time: number) => void
        onTimelineMoveTo: (time: number) => void
        onPlay: (play: boolean) => void
        playing: boolean
    }

    interface FrameContainerStates {
        scrollTop: number,
        scrollLeft: number
        scale: number
        alignGraduations: boolean
    }
}


export default class FrameContainer extends Component<FrameContainerProps, FrameContainerStates> {
    containerRef: RefObject<HTMLDivElement>
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()
        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
            scale: 1,
            alignGraduations: true
        }
    }

    onTimelineMove = (time: number) => {
        this.props.onTimelineMove(time)
    }

    onTimelineMoveTo = (time: number) => {
        this.props.onTimelineMoveTo(time)
    }

    position2Time = (position) => {
        if (this.containerRef && this.containerRef.current) {
            return position * this.props.totalTime / (this.state.scale * this.containerRef.current.clientWidth) + this.props.start;
        } else {
            return 0;
        }
    }

    time2Position = (time: number) => {
        if (this.containerRef && this.containerRef.current) {
            const width = this.containerRef.current.clientWidth
            return (time - this.props.start) * this.state.scale * width / this.props.totalTime
        } else {
            return 0
        }
    }

    onAnimationVerticalScroll = (top: number) => {
        this.setState({ scrollTop: top })
    }

    onChangeTimeRuler = (scale, scrollLeft) => {
        this.setState({ scale, scrollLeft })
    }

    render() {
        return (
            <div className={"flex-row"} style={{ height: "100%" }}>
                <div className="flex-column" style={{ width: 200 }}>
                    <div style={{ height: TimeRulerHeight }}>
                        <PlayStopButton onPlay={this.props.onPlay} playing={this.props.playing} />
                    </div>
                    <CustomScrollContainer style={{ flex: 1 }} scrollTop={this.state.scrollTop} onScroll={this.onAnimationVerticalScroll}>
                        <FrameMetaList animations={this.props.svgAnimations} />
                    </CustomScrollContainer>
                </div>
                <div className="flex-column" ref={this.containerRef} style={{ overflowX: "hidden", flex: 1, position: "relative" }}>
                    <TimeRuler
                        wrapperStyle={{ height: TimeRulerHeight }}
                        totalTime={this.props.totalTime}
                        scale={this.state.scale}
                        scrollLeft={this.state.scrollLeft}
                        timelineMarginLeft={TimelineMarginLeft}
                        timelineMarginRight={TimelineMarginRight}
                        onChange={this.onChangeTimeRuler}
                    />
                    <CustomScrollContainer
                        style={{ flex: 1 }}
                        scrollTop={this.state.scrollTop}
                        onScroll={this.onAnimationVerticalScroll}
                        scrollX={false}
                    >
                        <FrameList
                            scale={this.state.scale}
                            totalTime={this.props.totalTime}
                            timelineMarginLeft={TimelineMarginLeft}
                            scrollLeft={this.state.scrollLeft}
                            animations={this.props.svgAnimations}
                            alignGraduations={this.state.alignGraduations}
                        />
                    </CustomScrollContainer>
                    <TimeCursor
                        time={this.props.innerTime}
                        totalTime={this.props.totalTime}
                        onMove={this.onTimelineMove}
                        onMoveTo={this.onTimelineMoveTo}
                        scale={this.state.scale}
                        timelineMarginLeft={TimelineMarginLeft}
                        scrollLeft={this.state.scrollLeft}
                        alignGraduations={this.state.alignGraduations}
                    />
                </div>
            </div>)
    }
}

class FrameMetaList extends React.PureComponent<{ animations: SvgAnimations }>{
    render() {
        return [...this.props.animations.entries()].map(([id, animations]) => {
            return (<div key={id}>
                <div className="frame-meta">{id}</div>
                {
                    [...animations.entries()].map(([attr, attrAnimations]) => {
                        return (<div className="frame-meta" key={attr}>{attr}</div>)
                    })
                }
            </div>)
        })
    }
}

type FrameListProps = {
    scale: number,
    totalTime: number,
    timelineMarginLeft: number,
    scrollLeft: number,
    animations: SvgAnimations,
    alignGraduations: boolean
}

class FrameList extends React.PureComponent<FrameListProps>{
    render() {
        let leftOffset = this.props.timelineMarginLeft - this.props.scrollLeft
        return <React.Fragment>
            <div
                className="time-ruler-grey-out"
                style={{
                    height: "100%",
                    position: "absolute",
                    width: 10000,
                    left: leftOffset + this.props.totalTime * pixelPerSecond(this.props.scale)
                }}
            ></div>
            <div className="frame-list" style={{
                width: this.props.totalTime * pixelPerSecond(this.props.scale),
                left: leftOffset,
                position: "absolute"
            }}>
                <div
                    className="time-ruler-grey-out"
                    style={{
                        height: "100%",
                        position: "absolute",
                        width: 10000,
                        left: this.props.totalTime * pixelPerSecond(this.props.scale)
                    }}
                ></div>
                {
                    [...this.props.animations.entries()].map(([id, animations]) => {
                        return (<div key={id}>
                            <div className="frame-meta"></div>
                            {
                                [...animations.entries()].map(([attr, attrAnimations]) => {
                                    return (<div key={attr} className="frame-wrapper">
                                        {
                                            attrAnimations.map((frame) => {
                                                return (< FrameHolder
                                                    key={`${frame[0]},${frame[1]}`}
                                                    start={frame[0]}
                                                    end={frame[1]}
                                                    totalTime={this.props.totalTime}
                                                    scale={this.props.scale}
                                                    frame={frame[2]}
                                                    attribute={attr}
                                                    animations={attrAnimations}
                                                    alignGraduations={this.props.alignGraduations}
                                                />)
                                            })
                                        }
                                    </div>)
                                })
                            }
                        </div>)
                    })
                }
            </div>
        </React.Fragment>
    }
}