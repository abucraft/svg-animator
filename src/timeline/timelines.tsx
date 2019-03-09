import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'

import { TweenLite } from 'gsap/TweenMax'
import { Map, List } from 'immutable'

import { Object } from 'core-js';
import { compose } from 'redux';

import FrameContainer from './frame-container'
import { moveTimeline } from '../core/actions'
import { SortedMap } from '../utils/sorted-map'
import { SizedComponent } from '../utils/sized-component'
import { AnimationSignal } from '../core/store'

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
        curProps?: TimelineProps
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
class Timelines extends Component<TimelineProps, TimelineState> {
    constructor(props) {
        super(props)
        this.state = {
            svgAnimations: Map(),
            start: 0,
            scale: 1,
            innerTime: this.props.currentTime
        }
    }
    static buildState(nextProps: TimelineProps, prevState: TimelineState): TimelineState {
        let svgAnimations: SvgAnimations = Map()
        nextProps.svgStates.forEach((svgState, id) => {
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
                        if ((animation = prevState.svgAnimations.getIn([id, attr, frameKey])) !== undefined) {
                            changed = animation.from !== fromValue || animation.to !== toValue
                        } else {
                            changed = true
                        }
                        // copy old frame to new svgAnimations
                        singleSvgAnimations = singleSvgAnimations.setIn([attr], prevState.svgAnimations.getIn([id, attr], Map()));
                        if (changed) {
                            singleSvgAnimations = singleSvgAnimations.setIn([attr, frameKey], { value: animation, tweenLite: createTweenLiteFrame(document.getElementById(initState.attributes.id), curTime - localPrevTime, attr, { from: fromValue, to: toValue }, nextProps.currentTime - frameKey.get(0)) })
                        }
                    }
                }
            }
            svgAnimations = svgAnimations.set(id, singleSvgAnimations);
        })

        let nextState = {
            ...prevState,
            svgAnimations: svgAnimations,
            innerTime: nextProps.currentTime,
            curProps: nextProps
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


    static getDerivedStateFromProps(nextProps: TimelineProps, prevState: TimelineState): TimelineState {
        if (prevState.curProps && prevState.curProps.svgStates === nextProps.svgStates) {
            return { ...prevState, curProps: nextProps, innerTime: nextProps.currentTime }
        } else {
            return Timelines.buildState(nextProps, prevState)
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
            />
        )
    }
}

export default compose(SizedComponent, connect(mapStateToProps, mapDispatchToProps))(Timelines)