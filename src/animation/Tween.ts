import { setTransform } from "../utils/Utils";
import Color from 'color';

interface PT<T> {
    seek(time: number): T
}

class NumberPT implements PT<number>{
    duration: number
    fromValue: number
    toValue: number
    constructor(duration: number, fromValue: number | string, toValue: number | string) {
        this.duration = duration
        this.fromValue = typeof fromValue === "number" ? fromValue : parseFloat(fromValue)
        this.toValue = typeof toValue === "number" ? toValue : parseFloat(toValue)
    }
    seek(time: number) {
        return ((this.toValue - this.fromValue) * Math.min(Math.max(time, 0), this.duration) / this.duration) + this.fromValue
    }
}

class ColorPT implements PT<string>{
    duration: number
    rgbaPTs: NumberPT[]
    fromValue: string
    toValue: string

    constructor(duration: number, fromValue: string, toValue: string) {
        this.duration = duration
        this.fromValue = fromValue
        this.toValue = toValue
        let fromColor = Color(fromValue)
        let toColor = Color(toValue)
        this.rgbaPTs = [
            new NumberPT(duration, fromColor.red(), toColor.red()),
            new NumberPT(duration, fromColor.green(), toColor.green()),
            new NumberPT(duration, fromColor.blue(), toColor.blue()),
            new NumberPT(duration, fromColor.alpha(), toColor.alpha())
        ]
    }

    seek(time: number) {
        if (time <= 0) {
            return this.fromValue
        }
        if (time >= this.duration) {
            return this.toValue
        }
        return `rgba(${this.rgbaPTs[0].seek(time)},${this.rgbaPTs[1].seek(time)},${this.rgbaPTs[2].seek(time)},${this.rgbaPTs[3].seek(time)})`
    }
}

type PTGroup = {
    type: "attr" | "transform"
    ptMap: { [key: string]: PT<any> }
    currentValues: { [key: string]: any }
}

function applyPTGroup(target: HTMLElement, ptGroup: PTGroup) {
    if (ptGroup.type === "attr") {
        Object.keys(ptGroup.currentValues).forEach(k => {
            target.setAttribute(k, ptGroup.currentValues[k])
        })
    }
    if (ptGroup.type === "transform") {
        setTransform(target as any, ptGroup.currentValues)
    }
}

export class Tween {
    target: HTMLElement
    duration: number
    ptGroups: PTGroup[]
    constructor(target: HTMLElement, duration: number, fromValue: object, toValue: object) {
        this.target = target
        this.duration = duration
        this.ptGroups = []
        let attrPtGroup: PTGroup = null
        let transformPTGroup: PTGroup = null
        Object.keys(fromValue).forEach((k) => {
            switch (k) {
                case "x":
                case "y":
                case "scaleX":
                case "scaleY":
                case "rotation":
                case "xOrigin":
                case "yOrigin":
                    transformPTGroup = (transformPTGroup || { type: "transform", ptMap: {}, currentValues: {} })
                    transformPTGroup.ptMap[k] = new NumberPT(duration, fromValue[k], toValue[k])
                    break;
                case "attr":
                    Object.keys(fromValue[k]).forEach((attrk) => {
                        attrPtGroup = (attrPtGroup || { type: "attr", ptMap: {}, currentValues: {} })
                        switch (attrk) {
                            case "fill":
                            case "stroke":
                                attrPtGroup.ptMap[attrk] = new ColorPT(duration, fromValue[k][attrk], toValue[k][attrk])
                                break;
                            default:
                                attrPtGroup.ptMap[attrk] = new NumberPT(duration, fromValue[k][attrk], toValue[k][attrk])
                                break;
                        }
                    })
                    break;
            }
        })
        attrPtGroup && this.ptGroups.push(attrPtGroup)
        transformPTGroup && this.ptGroups.push(transformPTGroup)
    }

    seek(time: number) {
        this.ptGroups.forEach(ptg => {
            Object.keys(ptg.ptMap).forEach(k => {
                ptg.currentValues[k] = ptg.ptMap[k].seek(time)
            })
            applyPTGroup(this.target, ptg)
        })
        return this
    }
}