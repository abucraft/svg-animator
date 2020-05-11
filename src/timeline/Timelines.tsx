import { Component } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'

import { compose } from 'redux';

import FrameContainer from './FrameContainer'
import { moveTimeline } from '../core/Actions'
import { SizedComponent } from '../utils/SizedComponent'
import { SvgEditorContext, WithSvgEditorContext } from '../app/SvgEditorContext';
import { DefaultTransform } from '../utils/Utils';
import { Tween } from '../animation/Tween';
import produce from 'immer';

declare global {

    
    type FrameValue = {
        from: any
        to: any
    }

    type SvgAnimationFrame = {
        type?: "translate" | "rotate" | "attributes" | "scale"
        value: FrameValue
        tweenLite?: Tween
        target?: any
    }

    type Frame = [number, number, SvgAnimationFrame]

    // {id: {attribute: frame[]}}
    type SvgAnimations = Map<string, Map<string, Frame[]>>

    interface AnimationFactory {
        createFrame: (target, duration, attr, frameValue: FrameValue, targetTime: number) => Tween
        createTransformFrame: (target, duration, fromTransform: Transform, toTransform: Transform, targetTime: number) => Tween
    }
};

type TimelineProps = SvgEditorContextComponentProps

interface TimelineState {
    svgAnimations: SvgAnimations
    innerTime: number
    start: number
    scale: number
}

export const TweenAnimationFactory: AnimationFactory = {
    createFrame: (target, duration, attr, frameValue: FrameValue, targetTime: number) => {
        let fromObj = { [attr]: frameValue.from }
        let toObj = { [attr]: frameValue.to }
        return new Tween(target, duration, { attr: fromObj }, { attr: toObj }).seek(targetTime)
    },

    createTransformFrame: (target, duration, fromTransform: Transform, toTransform: Transform, targetTime: number) => {
        return new Tween(target, duration, fromTransform, toTransform).seek(targetTime)
    }
}

function setUpInitTransformStack(initTransform): { [key: string]: TimeAndValue } {
    let keys = Object.keys(DefaultTransform)
    let v: { [key: string]: TimeAndValue } = {}
    keys.forEach(k => {
        v[k] = {
            value: initTransform[k] || DefaultTransform[k],
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
            svgAnimations: new Map(),
            start: 0,
            scale: 1,
            innerTime: this.props.editorContext.currentTime
        }
    }

    static buildAnimationsFromState(svgStates: SvgStateMap, existsAnimations: SvgAnimations, currentTime: number, animationFactory: AnimationFactory): SvgAnimations {
        // Recreate the animation frames every time, don't consider the time cost(it's very small currently)
        // TODO: write an more efficient way for creating the frames
        let svgAnimations: SvgAnimations = new Map()
        svgStates.forEach((svgState, id) => {
            let keys = [...svgState.keys()]
            keys.sort((v1, v2) => v1 - v2)
            let prevTime = keys[0]
            let initState = svgState.get(prevTime)
            let stateStack: { [key: string]: TimeAndValue } = {}
            let transformStack: { [key: string]: TimeAndValue } = setUpInitTransformStack(initState.transform)
            let singleSvgAnimations = new Map<string, Frame[]>()
            for (let i = 1; i < keys.length; i++) {
                let curTime = keys[i]
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
                                singleSvgAnimations.set(translateAttr, []);
                            singleSvgAnimations.get(translateAttr).push([startTime, curTime, {
                                type: "translate",
                                value: {
                                    from: fromValue,
                                    to: toValue
                                },
                                tweenLite: animationFactory.createTransformFrame(document.getElementById(initState.attributes.id), curTime - startTime, fromValue, toValue, currentTime - startTime)
                            }])
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
                        if (toRotation !== fromRotation || fromXOrigin !== toXOrigin || fromYOrigin !== toYOrigin) {
                            let rotationAttr = "rotate(deg,x,y)"
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
                                singleSvgAnimations.set(rotationAttr, []);
                            singleSvgAnimations.get(rotationAttr).push([startTime, curTime, {
                                type: "rotate",
                                value: {
                                    from: fromValue,
                                    to: toValue
                                },
                                target: target,
                                tweenLite: animationFactory.createTransformFrame(target, curTime - startTime, fromValue, toValue, currentTime - startTime)
                            }])
                        }
                    }
                    if (transform.scaleX || transform.scaleY) {
                        let fromScaleXObj = transformStack["scaleX"]
                        let fromScaleYObj = transformStack["scaleY"]
                        let fromScaleX = fromScaleXObj.value
                        let fromScaleY = fromScaleYObj.value
                        let startTime = Math.max(fromScaleYObj.time, fromScaleXObj.time)
                        transformStack["scaleX"] = { time: curTime, value: transform.scaleX || 0 }
                        transformStack["scaleY"] = { time: curTime, value: transform.scaleY || 0 }
                        let toX = transform.scaleX || 0
                        let toY = transform.scaleY || 0
                        if (toX !== fromScaleX || toY !== fromScaleY) {
                            let scaleAttr = "scale(x,y)"
                            let fromValue = {
                                scaleX: fromScaleX,
                                scaleY: fromScaleY
                            }
                            let toValue = {
                                scaleX: toX,
                                scaleY: toY
                            }
                            if (singleSvgAnimations.get(scaleAttr) === undefined)
                                singleSvgAnimations.set(scaleAttr, []);
                            singleSvgAnimations.get(scaleAttr).push([startTime, curTime, {
                                type: "scale",
                                value: {
                                    from: fromValue,
                                    to: toValue
                                },
                                tweenLite: animationFactory.createTransformFrame(document.getElementById(initState.attributes.id), curTime - startTime, fromValue, toValue, currentTime - startTime)
                            }])
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
                        let animation = { from: fromValue, to: toValue }
                        // If attr's animations map is not initialized, initialize it
                        if (singleSvgAnimations.get(attr) === undefined)
                            singleSvgAnimations.set(attr, []);
                        singleSvgAnimations.get(attr).push([localPrevTime, curTime, {
                            type: "attributes",
                            value: animation,
                            tweenLite: animationFactory.createFrame(document.getElementById(initState.attributes.id), curTime - localPrevTime, attr, { from: fromValue, to: toValue }, currentTime - localPrevTime)
                        }])
                    }
                }
            }
            svgAnimations = svgAnimations.set(id, singleSvgAnimations);
        })
        return svgAnimations
    }

    static buildState(props: TimelineProps, componentState: TimelineState): TimelineState {
        let svgAnimations = Timelines.buildAnimationsFromState(props.editorContext.svgStates, componentState.svgAnimations, props.editorContext.currentTime, TweenAnimationFactory)
        let nextState = {
            ...componentState,
            svgAnimations: svgAnimations,
            innerTime: props.editorContext.currentTime
        }
        return nextState
    }

    onTimelineMove = (time: number) => {
        // TODO: fix the order when playing transform animation
        this.state.svgAnimations.forEach((animations) => {
            animations.forEach((attrAnimations, attr) => {
                attrAnimations.forEach((animation) => {
                    let timegap = time - animation[0]
                    if (timegap > 0) {
                        animation[2].tweenLite.seek(timegap);
                    }
                })
            })
        });
        this.props.editorContext.animationSignal.next(time);
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
            this.props.editorContext.onTimelineMoveTo(this.playTime)
        }
    }

    componentDidUpdate(prevProps: TimelineProps) {
        if (prevProps !== this.props) {
            // console.log("prev state in timelin", prevProps.svgStates)
            // console.log("current state in timeline", this.props.svgStates)
            if (prevProps.editorContext.svgStates !== this.props.editorContext.svgStates) {
                this.setState(Timelines.buildState(this.props, this.state))
            } else {
                this.setState({ innerTime: this.props.editorContext.currentTime })
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
                onTimelineMoveTo={this.props.editorContext.onTimelineMoveTo}
                totalTime={this.props.editorContext.totalTime}
                innerTime={this.state.innerTime}
                start={this.state.start}
                scale={this.state.scale}
                svgAnimations={this.state.svgAnimations}
                onPlay={this.handlePlay}
            />
        )
    }
}

export default SizedComponent(WithSvgEditorContext(Timelines))