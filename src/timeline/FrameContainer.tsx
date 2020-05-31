
import { Component, RefObject } from 'react'
import * as React from 'react'
import PlayStopButton from './PlayStopButton'
import FrameHolder from './FrameHolder'
import TimeRuler from './TimeRuler'
import TimeCursor from './TimeCursor'
import { CustomScrollContainer } from './CustomScrollContainer'
import { TimelineMarginLeft, TimelineMarginRight, BaseTimeSeconds, pixelPerSecond } from './Constants'
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
            scale: 1
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
                    <div style={{ height: 40 }}>
                        <PlayStopButton onPlay={this.props.onPlay} playing={this.props.playing} />
                    </div>
                    <CustomScrollContainer style={{ flex: 1 }} scrollTop={this.state.scrollTop} onScroll={this.onAnimationVerticalScroll}>
                        <FrameMetaList animations={this.props.svgAnimations} />
                    </CustomScrollContainer>
                </div>
                <div className="flex-column" ref={this.containerRef} style={{ overflowX: "hidden", flex: 1, position: "relative" }}>
                    <TimeRuler
                        wrapperStyle={{ height: 40 }}
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
                        alignGraduations={true}
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
    animations: SvgAnimations
}

class FrameList extends React.PureComponent<FrameListProps>{
    render() {
        return <div className="frame-list" style={{
            width: this.props.totalTime * pixelPerSecond(this.props.scale),
            left: this.props.timelineMarginLeft - this.props.scrollLeft,
            position: "absolute"
        }}>
            {
                [...this.props.animations.entries()].map(([id, animations]) => {
                    return (<div key={id}>
                        <div className="frame-meta"></div>
                        {
                            [...animations.entries()].map(([attr, attrAnimations]) => {
                                return (<div key={attr} className="frame-wrapper">
                                    {
                                        attrAnimations.map((frame) => {

                                            let left = frame[0] / this.props.totalTime
                                            let right = frame[1] / this.props.totalTime
                                            return (< FrameHolder key={`${frame[0]},${frame[1]}`} left={left} width={right - left} attribute={attr} />)
                                        })
                                    }
                                </div>)
                            })
                        }
                    </div>)
                })
            }
        </div>
    }
}