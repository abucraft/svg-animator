import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'

import { TweenMax } from 'gsap/umd/TweenMax'
import { Map, List } from 'immutable'

import { Object } from 'core-js';
import { compose } from 'redux';

import FrameContainer from './FrameContainer'
import { moveTimeline } from '../core/Actions'
import { SizedComponent } from '../utils/SizedComponent'
import { SvgEditorContext } from '../app/SvgEditorContext';

declare global {

    type TimelineStateProps = {
        svgStates: SvgStateMap
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
        type?: "rotation"
        value: FrameValue
        tweenLite: TweenMax
        originTween?: TweenMax
        helper?: object
        target?: any
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

function createTweenMaxFrame(target, duration, attr, frameValue: FrameValue, targetTime: number) {
    let fromObj = { [attr]: frameValue.from }
    let toObj = { [attr]: frameValue.to }
    return TweenMax.fromTo(target, duration, { attr: fromObj }, { attr: toObj }).pause().seek(targetTime)
}

function createTweenMaxTransformFrame(target, duration, fromTransform: Transform, toTransform: Transform, targetTime: number) {
    return TweenMax.fromTo(target, duration, fromTransform, toTransform).pause().seek(targetTime)
}

function createTweenMaxTransformOriginFrame(helper, target, duration, fromTransform: Transform, toTransform: Transform, targetTime: number) {
    let tween = TweenMax.fromTo(helper, duration, fromTransform, toTransform).pause().seek(targetTime)
    Object.keys(fromTransform).forEach((key) => {
        target._gsTransform[key] = helper[key]
    })
    return tween
}

function setUpInitTransformStack(initTransform): { [key: string]: TimeAndValue } {
    let keys = ["x", "y", "rotation", "xOrigin", "yOrigin"]
    let v: { [key: string]: TimeAndValue } = {}
    keys.forEach(k => {
        v[k] = {
            value: initTransform[k] || 0,
            time: 0
        }
    })
    return v
}

type TimeAndValue = {
    time: number,
    value: any
}

// All mutations of animation state
export class Timelines extends Component<TimelineProps, TimelineState> {
    static contextType = SvgEditorContext
    context: SvgEditorContextType
    constructor(props) {
        super(props)
        this.state = {
            svgAnimations: Map(),
            start: 0,
            scale: 1,
            innerTime: this.props.currentTime
        }
    }

    static buildAnimationsFromState(svgStates: SvgStateMap, existsAnimations: SvgAnimations, currentTime: number): SvgAnimations {
        // Recreate the animation frames every time, don't consider the time cost(it's very small currently)
        let svgAnimations: SvgAnimations = Map()
        svgStates.forEach((svgState, id) => {
            let keys = svgState.keySeq().sort((v1, v2) => v1 - v2)
            let prevTime = keys.get(0)
            let initState = svgState.get(prevTime)
            let stateStack: { [key: string]: TimeAndValue } = {}
            let transformStack: { [key: string]: TimeAndValue } = setUpInitTransformStack(initState.transform)
            let singleSvgAnimations = Map<string, Map<FrameKey, SvgAnimationFrame>>()
            for (let i = 1; i < keys.count(); i++) {
                let curTime = keys.get(i)
                let state = svgState.get(curTime)
                // console.log("state in timeline", state)
                if (state.transform) {
                    let transform = state.transform
                    if (transform.x || transform.y) {
                        let fromXObj = transformStack["x"]
                        let fromYObj = transformStack["y"]
                        let fromX = fromXObj.value
                        let fromY = fromYObj.value
                        let startTime = Math.max(fromYObj.time, fromXObj.time)
                        transformStack["x"] = { time: curTime, value: transform.x || 0 }
                        transformStack["y"] = { time: curTime, value: transform.y || 0 }
                        let toX = transform.x || 0
                        let toY = transform.y || 0
                        if (toX !== fromX || toY !== fromY) {
                            let translateAttr = "translate(x,y)"
                            let fromValue = {
                                x: fromX,
                                y: fromY
                            }
                            let toValue = {
                                x: toX,
                                y: toY
                            }
                            if (singleSvgAnimations.get(translateAttr) === undefined)
                                singleSvgAnimations = singleSvgAnimations.set(translateAttr, Map());
                            singleSvgAnimations = singleSvgAnimations.setIn([translateAttr, List([startTime, curTime])], {
                                value: {
                                    from: fromValue,
                                    to: toValue
                                },
                                tweenLite: createTweenMaxTransformFrame(document.getElementById(initState.attributes.id), curTime - startTime, fromValue, toValue, currentTime - startTime)
                            })
                        }
                    }
                    if (transform.rotation || transform.xOrigin || transform.yOrigin) {
                        let fromRotation = transformStack["rotation"].value
                        let fromXOrigin = transformStack["xOrigin"].value
                        let fromYOrigin = transformStack["yOrigin"].value
                        let startTime = Math.max(transformStack["rotation"].time, transformStack["xOrigin"].time, transformStack["yOrigin"].time)
                        let toRotation = transform.rotation || 0
                        let toXOrigin = transform.xOrigin || 0
                        let toYOrigin = transform.yOrigin || 0
                        transformStack["rotation"] = { time: curTime, value: toRotation }
                        transformStack["xOrigin"] = { time: curTime, value: toXOrigin }
                        transformStack["yOrigin"] = { time: curTime, value: toYOrigin }
                        if (toRotation !== fromRotation || toXOrigin !== fromXOrigin || toYOrigin !== fromYOrigin) {
                            let rotationAttr = "rotate(deg,x,y)"
                            let helper = {}
                            let fromValue = {
                                rotation: fromRotation,
                                xOrigin: fromXOrigin,
                                yOrigin: fromYOrigin
                            }
                            let toValue = {
                                rotation: toRotation,
                                xOrigin: toXOrigin,
                                yOrigin: toYOrigin
                            }
                            let target = document.getElementById(initState.attributes.id)
                            if (singleSvgAnimations.get(rotationAttr) === undefined)
                                singleSvgAnimations = singleSvgAnimations.set(rotationAttr, Map());
                            singleSvgAnimations = singleSvgAnimations.setIn([rotationAttr, List([startTime, curTime])], {
                                type: "rotation",
                                value: {
                                    from: fromValue,
                                    to: toValue
                                },
                                helper: helper,
                                target: target,
                                originTween: createTweenMaxTransformOriginFrame(helper, target, curTime - startTime, { xOrigin: fromXOrigin, yOrigin: fromYOrigin }, { xOrigin: toXOrigin, yOrigin: toYOrigin }, currentTime - startTime),
                                tweenLite: createTweenMaxTransformFrame(target, curTime - startTime, fromValue, toValue, currentTime - startTime)
                            })
                        }
                    }
                }
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
                            animation = { from: fromValue, to: toValue }
                        }
                        // If attr's animations map is not initialized, initialize it
                        if (singleSvgAnimations.get(attr) === undefined)
                            singleSvgAnimations = singleSvgAnimations.set(attr, Map());
                        if (changed) {
                            singleSvgAnimations = singleSvgAnimations.setIn([attr, frameKey], { value: animation, tweenLite: createTweenMaxFrame(document.getElementById(initState.attributes.id), curTime - localPrevTime, attr, { from: fromValue, to: toValue }, currentTime - frameKey.get(0)) })
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
                        if (animation.originTween) {
                            animation.originTween.seek(timegap);
                            Object.keys(animation.helper).forEach((key) => {
                                animation.target._gsTransform[key] = animation.helper[key]
                            })
                        }
                        animation.tweenLite.seek(timegap);
                    }
                })
            })
        });
        this.context.animationSignal.next(time);
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
            // console.log("prev state in timelin", prevProps.svgStates)
            // console.log("current state in timeline", this.props.svgStates)
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