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