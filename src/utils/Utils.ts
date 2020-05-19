import { DefaultAttributes } from "../core/SVGDefaultValues"
import Color from "color"

declare global {
    type AttrValueType = 'number' | 'string' | 'color' | 'path'

    type Point2D = { x: number, y: number }
    type DeltaPoint2D = { dx: number, dy: number }

    type Rect2D = Point2D & { width: number, height: number }
}

export const domPaser = new DOMParser()

export const SVG_XMLNS = "http://www.w3.org/2000/svg"

export const deepCopy = function <T>(obj: T): T {
    if (obj instanceof Array) {
        return obj.map(v => deepCopy(v)) as any
    }
    if (typeof obj === "object") {
        var res = {}
        Object.keys(obj).forEach(key => {
            res[key] = deepCopy(obj[key])
        })
        return res as T
    }
    return obj
}

export function getAttributes<T extends { [key: string]: AttrValueType }>(elm: SVGElement, schema: T): { [k in keyof T]: any } {
    return Object.fromEntries(Object.entries(schema).map(([key, s]) => {
        let strValue = elm.getAttribute(key as any)
        let value = strValue || DefaultAttributes[key];
        switch (s) {
            case 'number':
                value = (value && parseFloat(value) as any) || 0
                break;

        }
        return [key, value]
    }))
}

export function setAttributes(elm: SVGElement, attrs: { [key: string]: any }) {
    Object.entries(attrs).forEach(([k, v]) => {
        elm.setAttribute(k, v.toString())
    })
}

function parse(str: string): { [key: string]: string[] } {
    var b = {};
    var matchRes = str.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g)
    for (var i in matchRes) {
        var c = matchRes[i].match(/[\w\.\-]+/g);
        b[c.shift()] = c;
    }
    return b;
}

function apply(value: { [key: string]: string[] }): string {
    var res = ""
    Object.entries(value).forEach(([k, v]) => {
        res += `${k}(${v.join(' ')}) `
    })
    return res;
}

export function getTransformString(transform: Transform) {
    var transformObj = {}
    transformObj["translate"] = [transform.x, transform.y]
    transformObj["rotate"] = [transform.rotation, transform.xOrigin, transform.yOrigin]
    transformObj["scale"] = [transform.scaleX, transform.scaleY]
    return apply(transformObj)
}

export function setTransform(elm: SVGElement, transform: Transform) {
    elm._gsTransform = elm._gsTransform || { ...DefaultTransform }
    elm._gsTransform.x = transform.x === undefined ? elm._gsTransform.x : transform.x
    elm._gsTransform.y = transform.y === undefined ? elm._gsTransform.y : transform.y
    elm._gsTransform.rotation = transform.rotation === undefined ? elm._gsTransform.rotation : transform.rotation
    elm._gsTransform.xOrigin = transform.xOrigin === undefined ? elm._gsTransform.xOrigin : transform.xOrigin
    elm._gsTransform.yOrigin = transform.yOrigin === undefined ? elm._gsTransform.yOrigin : transform.yOrigin
    elm._gsTransform.scaleX = transform.scaleX === undefined ? elm._gsTransform.scaleX : transform.scaleX
    elm._gsTransform.scaleY = transform.scaleY === undefined ? elm._gsTransform.scaleY : transform.scaleY
    elm.setAttribute('transform', getTransformString(elm._gsTransform))
}

export const DefaultTransform: Transform = {
    x: 0,
    y: 0,
    rotation: 0,
    xOrigin: 0,
    yOrigin: 0,
    scaleX: 1,
    scaleY: 1
}

export function getTransform(elm: SVGElement): Transform {

    if (elm._gsTransform) {
        return { ...DefaultTransform, ...elm._gsTransform }
    } else {
        return { ...DefaultTransform }
    }
}

export function getCenterRotateOrigin(bbox: DOMRect, scaleX: number, scaleY: number) {
    return {
        xOrigin: (bbox.x + bbox.width / 2) * scaleX,
        yOrigin: (bbox.y + bbox.height / 2) * scaleY
    }
}

export function pointsToLinePath(points: Point2D[]) {
    if (points && points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`
    }
    if (points && points.length > 1) {
        let d = `M ${points[0].x} ${points[0].y} `
        for (let i = 1; i < points.length; i++) {
            d = d + `L ${points[i].x} ${points[i].y} `
        }
        d = d + ' Z'
        return d
    }
}

export function ColorToRGBA(color: Color){
    return `rgba(${color.red()},${color.green()},${color.blue()},${color.alpha()})`
}