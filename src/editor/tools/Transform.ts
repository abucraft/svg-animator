import { DragPoint } from "./DragPoint";
import { dispatch } from "../../core/Store";
import { updateSvgAttribute, selectSvgElement } from "../../core/Actions";
import { getAttributes, setAttributes } from "../../utils/Utils";


export class Transform {
    nwpoint: DragPoint
    nepoint: DragPoint
    swpoint: DragPoint
    sepoint: DragPoint
    bbox: Rect2D
    selectSvgElements: SVGElement[]
    constructor(svgRoot: SVGSVGElement, bbox: Rect2D, selectedElements: SVGElement[], onResize: () => void) {
        this.selectSvgElements = selectedElements
        this.nwpoint = new DragPoint(svgRoot, { x: bbox.x, y: bbox.y }, (p) => {
            selectedElements.forEach(elm => {
                if (elm.nodeName === 'ellipse') {
                    let { cx, cy, rx, ry } = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                    cx = cx + (p.dx / 2)
                    cy = cy + (p.dy / 2)
                    rx = rx - (p.dx / 2)
                    ry = ry - (p.dy / 2)
                    setAttributes(elm, { cx, cy, rx, ry })
                }
            })
            onResize()
        }, this.onTransformEnd, 'nw-resize')
        this.nepoint = new DragPoint(svgRoot, { x: bbox.x + bbox.width, y: bbox.y }, (p) => {
            selectedElements.forEach(elm => {
                if (elm.nodeName === 'ellipse') {
                    let { cx, cy, rx, ry } = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                    cx = cx + (p.dx / 2)
                    cy = cy + (p.dy / 2)
                    rx = rx + (p.dx / 2)
                    ry = ry - (p.dy / 2)
                    setAttributes(elm, { cx, cy, rx, ry })
                }
            })
            onResize()
        }, this.onTransformEnd, 'ne-resize')
        this.swpoint = new DragPoint(svgRoot, { x: bbox.x, y: bbox.y + bbox.height }, p => {
            selectedElements.forEach(elm => {
                if (elm.nodeName === 'ellipse') {
                    let { cx, cy, rx, ry } = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                    cx = cx + (p.dx / 2)
                    cy = cy + (p.dy / 2)
                    rx = rx - (p.dx / 2)
                    ry = ry + (p.dy / 2)
                    setAttributes(elm, { cx, cy, rx, ry })
                }
            })
            onResize()
        }, this.onTransformEnd, 'sw-resize')
        this.sepoint = new DragPoint(svgRoot, { x: bbox.x + bbox.width, y: bbox.y + bbox.height }, p => {
            selectedElements.forEach(elm => {
                if (elm.nodeName === 'ellipse') {
                    let { cx, cy, rx, ry } = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                    cx = cx + (p.dx / 2)
                    cy = cy + (p.dy / 2)
                    rx = rx + (p.dx / 2)
                    ry = ry + (p.dy / 2)
                    setAttributes(elm, { cx, cy, rx, ry })
                }
            })
            onResize()
        }, this.onTransformEnd, 'se-resize')
    }

    onTransformEnd = () => {
        let attributesMap = {}
        this.selectSvgElements.forEach(elm => {
            if (elm.nodeName === 'ellipse') {
                let attributes = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                attributesMap[elm.id] = { attributes }
            }
        })
        dispatch(updateSvgAttribute(attributesMap))
    }

    setBBox(bbox: Rect2D) {
        this.bbox = bbox
        this.nwpoint.setPosition({ x: bbox.x, y: bbox.y })
        this.nepoint.setPosition({ x: bbox.x + bbox.width, y: bbox.y })
        this.swpoint.setPosition({ x: bbox.x, y: bbox.y + bbox.height })
        this.sepoint.setPosition({ x: bbox.x + bbox.width, y: bbox.y + bbox.height })
    }

    hide() {
        this.nwpoint.hide()
        this.nepoint.hide()
        this.swpoint.hide()
        this.sepoint.hide()
    }

    show() {
        this.nwpoint.show()
        this.nepoint.show()
        this.swpoint.show()
        this.sepoint.show()
    }

    componentWillUnmount() {
        this.nwpoint.componentWillUnmount()
        this.nepoint.componentWillUnmount()
        this.swpoint.componentWillUnmount()
        this.sepoint.componentWillUnmount()
    }
}