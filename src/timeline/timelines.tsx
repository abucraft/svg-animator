import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'

import { TweenLite } from 'gsap/umd/TweenMax'
import { Map, List } from 'immutable'

import { Object } from 'core-js';
import { compose } from 'redux';

import FrameContainer from './FrameContainer'
import { moveTimeline } from '../core/Actions'
import { SortedMap } from '../utils/SortedMap'
import { SizedComponent } from '../utils/SizedComponent'
import { AnimationSignal } from '../core/Store'

declare global {

    type TimelineStateProps = {
        svgStates: Map<string, SortedMap<any>>
        currentTime: number
        totalTime: number
    }

    type TimelineDispatchProps = {
        onTimelineMoveTo: (number) => void
    }

    type TimelineProps = TimelineStateProps & TimelineDispatchProps

    type FrameValue = {
        from: any
        to: any
    }

    type FrameKey = List<number>

    type SvgAnimationFrame = {
        value: FrameValue
        tweenLite: TweenLite
    }

    // {id: {attribute: { frame: value }}}
    type SvgAnimations = Map<string, Map<string, Map<FrameKey, SvgAnimationFrame>>>

    interface TimelineState {
        svgAnimations: SvgAnimations
        innerTime: number
        start: number
        scale: number
    }
};
function mapStateToProps(state: AppState): TimelineStateProps {
    return {
        svgStates: state.svg.svgStates,
        currentTime: state.svg.currentTime,
        totalTime: state.svg.totalTime
    }
}

function mapDispatchToProps(dispatch): TimelineDispatchProps {
    return {
        onTimelineMoveTo: (time: number) => {
            dispatch(moveTimeline(time));
        }
    }
}

function createTweenLiteFrame(target, duration, attr, frameValue: FrameValue, targetTime: number) {
    let fromObj = {}
    let toObj = {}
    fromObj[attr] = frameValue.from
    toObj[attr] = frameValue.to
    return TweenLite.fromTo(target, duration, { attr: fromObj }, { attr: toObj }).pause().seek(targetTime)
}

// All mutations of animation state
export class Timelines extends Component<TimelineProps, TimelineState> {
    constructor(props) {
        super(props)
        this.state = {
            svgAnimations: Map(),
            start: 0,
            scale: 1,
            innerTime: this.props.currentTime
        }
    }

    static buildAnimationsFromState(svgStates: Map<string, SortedMap<any>>, existsAnimations: SvgAnimations, currentTime: number): SvgAnimations {
        let svgAnimations: SvgAnimations = existsAnimations
        svgStates.forEach((svgState, id) => {
            let keys = svgState.keys()
            let prevTime = parseFloat(keys[0])
            let initState = JSON.parse(JSON.stringify(svgState.get(prevTime)))
            let stateStack: { [key: string]: { time: number, value: any } } = {}
            let singleSvgAnimations = Map<string, Map<FrameKey, SvgAnimationFrame>>()
            for (let i = 1; i < keys.length; i++) {
                let curTime = parseFloat(keys[i])
                let state = svgState.get(curTime)
                if (state.attributes) {
                    for (let [attr, toValue] of Object.entries(state.attributes)) {
                        let localPrevTime
                        let fromValue
                        if (stateStack[attr]) {
                            localPrevTime = stateStack[attr].time
                            fromValue = stateStack[attr].value
                        } else {
                            localPrevTime = prevTime
                            fromValue = initState.attributes[attr]
                        }
                        // update stateStack
                        stateStack[attr] = {
                            time: curTime,
                            value: toValue
                        }
                        // no need to update animation
                        if (fromValue == toValue) continue
                        let frameKey = List([localPrevTime, curTime])
                        let animation, changed
                        if ((animation = svgAnimations.getIn([id, attr, frameKey])) !== undefined) {
                            changed = animation.from !== fromValue || animation.to !== toValue
                        } else {
                            changed = true
                        }
                        // copy old frame to new svgAnimations
                        singleSvgAnimations = singleSvgAnimations.setIn([attr], svgAnimations.getIn([id, attr], Map()));
                        if (changed) {
                            singleSvgAnimations = singleSvgAnimations.setIn([attr, frameKey], { value: animation, tweenLite: createTweenLiteFrame(document.getElementById(initState.attributes.id), curTime - localPrevTime, attr, { from: fromValue, to: toValue }, currentTime - frameKey.get(0)) })
                        }
                    }
                }
            }
            svgAnimations = svgAnimations.set(id, singleSvgAnimations);
        })
        return svgAnimations
    }

    static buildState(props: TimelineProps, componentState: TimelineState): TimelineState {
        let svgAnimations = Timelines.buildAnimationsFromState(props.svgStates, componentState.svgAnimations, props.currentTime)
        let nextState = {
            ...componentState,
            svgAnimations: svgAnimations,
            innerTime: props.currentTime
        }
        return nextState
    }

    onTimelineMove = (time: number) => {
        this.state.svgAnimations.forEach((animations) => {
            animations.forEach((attrAnimations, attr) => {
                attrAnimations.forEach((animation, frameKey) => {
                    let timegap = time - frameKey.get(0)
                    if (timegap > 0) {
                        animation.tweenLite.seek(timegap);
                    }
                })
            })
        });
        AnimationSignal.next(time);
    }

    animationHandle = 0
    playTime = 0
    handlePlay = (play: boolean) => {
        if (play && this.animationHandle === 0) {
            let startTime = performance.now()
            this.playTime = this.state.innerTime
            let playAnimation = (time: DOMHighResTimeStamp) => {
                let diffTime = time - startTime + this.playTime * 1000
                startTime = time
                this.playTime = diffTime / 1000
                this.onTimelineMove(this.playTime)
                this.setState({ innerTime: this.playTime })
                this.animationHandle = requestAnimationFrame(playAnimation)
            }
            this.animationHandle = requestAnimationFrame(playAnimation)
        } else if (this.animationHandle) {
            cancelAnimationFrame(this.animationHandle)
            this.animationHandle = 0
            this.props.onTimelineMoveTo(this.playTime)
        }
    }

    componentDidUpdate(prevProps: TimelineProps) {
        if (prevProps !== this.props) {
            if (prevProps.svgStates !== this.props.svgStates) {
                this.setState(Timelines.buildState(this.props, this.state))
            } else {
                this.setState({ innerTime: this.props.currentTime })
            }
        }
    }

    shouldComponentUpdate(nextProps: TimelineProps, nextState: TimelineState) {
        return true
    }

    render() {
        return (
            <FrameContainer
                onTimelineMove={this.onTimelineMove}
                onTimelineMoveTo={this.props.onTimelineMoveTo}
                totalTime={this.props.totalTime}
                innerTime={this.state.innerTime}
                start={this.state.start}
                scale={this.state.scale}
                svgAnimations={this.state.svgAnimations}
                onPlay={this.handlePlay}
            />
        )
    }
}

export default compose(SizedComponent, connect(mapStateToProps, mapDispatchToProps))(Timelines)