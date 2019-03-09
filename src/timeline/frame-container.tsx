import { Component, RefObject } from 'react'
import * as React from 'react'
import { Map } from 'immutable'
import PlayStopButton from './play-stop-button'
import FrameHolder from './frame-holder'
import TimeRuler from './time-ruler'
import TimeCursor from './time-cursor'
declare global {
    interface FrameContainerProps {
        totalTime: number
        innerTime: number
        start: number
        scale: number
        svgAnimations: SvgAnimations
        onTimelineMove: (time: number) => void
        onTimelineMoveTo: (time: number) => void
        onPlay: (play: boolean) => void
    }

    interface FrameContainerStates {
        animationMap: Map<string, Map<string, [SvgAnimationFrame]>>
    }
}
export default class FrameContainer extends Component<FrameContainerProps> {
    containerRef: RefObject<HTMLDivElement>
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()
    }

    groupByProps(svgAnimations: SvgAnimations) {
        svgAnimations.map((framesMap) => {

        })
    }

    onTimelineMove = (position: number) => {
        this.props.onTimelineMove(this.position2Time(position))
    }

    onTimelineMoveTo = (position: number) => {
        this.props.onTimelineMoveTo(this.position2Time(position))
    }

    position2Time = (position) => {
        if (this.containerRef && this.containerRef.current) {
            return position * this.props.totalTime / (this.props.scale * this.containerRef.current.clientWidth) + this.props.start;
        } else {
            return 0;
        }
    }

    time2Position = (time: number) => {
        if (this.containerRef && this.containerRef.current) {
            const width = this.containerRef.current.clientWidth
            return (time - this.props.start) * this.props.scale * width / this.props.totalTime
        } else {
            return 0
        }
    }

    render() {
        return (
            <div className={"flex-row"} style={{ height: "100%" }}>
                <div className="flex-column" style={{ width: 200 }}>
                    <div style={{ height: 40 }}>
                        <PlayStopButton onPlay={this.props.onPlay} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <FrameMetaList animations={this.props.svgAnimations} />
                    </div>
                </div>
                <div className="flex-row" ref={this.containerRef} style={{ overflowX: "hidden", flex: 1 }}>
                    <div className="flex-column" style={{ flex: 1, position: 'relative', marginLeft: '10px', marginRight: '10px', overflowX: 'initial' }}>
                        <div style={{ height: 40, display: 'flex' }}>
                            <TimeRuler totalTime={this.props.totalTime} start={this.props.start} scale={this.props.scale} />
                        </div>
                        <div className="timelines">
                            <FrameList animations={this.props.svgAnimations} time2Position={this.time2Position} />
                        </div>
                        <TimeCursor position={this.time2Position(this.props.innerTime)} min={0} onMove={this.onTimelineMove} onMoveTo={this.onTimelineMoveTo} />
                    </div>
                </div>
            </div>)
    }
}

class FrameMetaList extends React.PureComponent<{ animations: SvgAnimations }>{
    render() {
        return this.props.animations.map((animations, id) => {
            return (<div key={id}>
                <div className="frame-meta">{id}</div>
                {
                    animations.map((attrAnimations, attr) => {
                        return (<div className="frame-meta" key={attr}>{attr}</div>)
                    }).toList()
                }
            </div>)
        }).toList()
    }
}

class FrameList extends React.PureComponent<{ time2Position: (time: number) => number, animations: SvgAnimations }>{
    render() {
        return this.props.animations.map((animations, id) => {
            return (<div key={id}>
                <div className="frame-meta"></div>
                {
                    animations.map((attrAnimations, attr) => {
                        return (<div key={attr} className="frame-wrapper">
                            {
                                attrAnimations.map((animation, frameKey) => {
                                    let left = this.props.time2Position(frameKey.get(0))
                                    let right = this.props.time2Position(frameKey.get(1))
                                    return (< FrameHolder key={`${frameKey.get(0)},${frameKey.get(1)}`} left={left} width={right - left} attribute={attr} />)
                                }).toList()
                            }
                        </div>)
                    }).toList()
                }
            </div>)
        }).toArray()
    }

    rerenderFrames = () => { this.forceUpdate() }

    componentDidMount() {
        window.addEventListener('resize', this.rerenderFrames)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.rerenderFrames)
    }
}