import { RectDragPoint } from "./DragPoint";
import { dispatch } from "../../core/Store";
import { updateSvgAttribute, selectSvgElement } from "../../core/Actions";
import { getAttributes, setAttributes } from "../../utils/Utils";
import { RotatePoint } from "./RotatePoint";

export class TransformControl {
    nwpoint: RectDragPoint
    nepoint: RectDragPoint
    swpoint: RectDragPoint
    sepoint: RectDragPoint
    nwRotatePoint: RotatePoint
    bboxRaw: Rect2D
    selectSvgElements: SVGElement[]
    constructor(svgRoot: SVGSVGElement, svgEditorContext: SvgEditorContextType, bboxRaw: Rect2D, selectedElements: SVGElement[], onResize: () => void) {
        this.selectSvgElements = selectedElements
        this.bboxRaw = bboxRaw
        this.nwpoint = new RectDragPoint(svgRoot, { x: bboxRaw.x, y: bboxRaw.y }, (p) => {
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
        this.nepoint = new RectDragPoint(svgRoot, { x: bboxRaw.x + bboxRaw.width, y: bboxRaw.y }, (p) => {
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
        this.swpoint = new RectDragPoint(svgRoot, { x: bboxRaw.x, y: bboxRaw.y + bboxRaw.height }, p => {
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
        this.sepoint = new RectDragPoint(svgRoot, { x: bboxRaw.x + bboxRaw.width, y: bboxRaw.y + bboxRaw.height }, p => {
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
        this.nwRotatePoint = new RotatePoint(svgRoot, svgEditorContext, { x: bboxRaw.x, y: bboxRaw.y }, this.getCenter(), 0, () => { }, () => { }, 'nw')
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

    getCenter(): Point2D {
        return { x: this.bboxRaw.x + this.bboxRaw.width / 2, y: this.bboxRaw.y + this.bboxRaw.height / 2 }
    }

    setBBox(bboxRaw: Rect2D) {
        this.bboxRaw = bboxRaw
        let center = this.getCenter()
        this.nwpoint.setPosition({ x: bboxRaw.x, y: bboxRaw.y })
        this.nepoint.setPosition({ x: bboxRaw.x + bboxRaw.width, y: bboxRaw.y })
        this.swpoint.setPosition({ x: bboxRaw.x, y: bboxRaw.y + bboxRaw.height })
        this.sepoint.setPosition({ x: bboxRaw.x + bboxRaw.width, y: bboxRaw.y + bboxRaw.height })
        this.nwRotatePoint.setPosition({ x: bboxRaw.x, y: bboxRaw.y }, this.getCenter(), 0)
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