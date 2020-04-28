import { setTransform } from "../utils/Utils";
import { number } from "prop-types";

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
                        attrPtGroup.ptMap[attrk] = new NumberPT(duration, fromValue[k][attrk], toValue[k][attrk])
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