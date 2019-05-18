import { Map } from 'immutable'
declare global {
    type AttrValueType = 'number' | 'string'

    type Point2D = { x: number, y: number }
    type DeltaPoint2D = { dx: number, dy: number }

    type Rect2D = Point2D & { width: number, height: number }
}

export function dispatchWindowResize() {
    window.dispatchEvent(new Event('resize'));
}

export const domPaser = new DOMParser()

export function getAttributes<T extends { [key: string]: AttrValueType }>(elm: SVGElement, schema: T): { [k in keyof T]: any } {
    return Map(schema).map((s, key) => {
        let strValue = elm.getAttribute(key as any)
        switch (s) {
            case 'number':
                return parseFloat(strValue) as any
            case 'string':
                return strValue as any
        }
    }).toObject() as any
}

export function setAttributes(elm: SVGElement, attrs: { [key: string]: any }) {
    Map(attrs).forEach((v, k) => {
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
    Map(value).forEach((v, k) => {
        res += `${k}(${v.join(' ')})`
    })
    return res;
}

export function setTransform(elm: SVGElement, transform: Transform) {
    var transformObj = {}
    if (transform.translate)
        transformObj["translate"] = [transform.translate.x.toString(), transform.translate.y.toString()]
    if (transform.rotateDegree)
        transformObj["rotate"] = [transform.rotateDegree]
    elm.setAttribute('transform', apply(transformObj))
}

export function getTranslate(elm: SVGElement): Point2D {
    var transformStr = elm.getAttribute("transform")
    var transformObj = {}
    if (transformStr) {
        transformObj = parse(transformStr)
    }
    var translate = transformObj["translate"]
    return translate && translate.length == 2 && { x: parseFloat(translate[0]), y: parseFloat(translate[1]) }
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
        return d
    }
}