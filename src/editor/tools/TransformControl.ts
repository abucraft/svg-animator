import { RectDragPoint } from "./DragPoint";
import { dispatch } from "../../core/Store";
import { updateSvgAttribute, selectSvgElement } from "../../core/Actions";
import { getAttributes, setAttributes, setTransform } from "../../utils/Utils";
import { RotatePoint } from "./RotatePoint";

export class TransformControl {
    nwpoint: RectDragPoint
    nepoint: RectDragPoint
    swpoint: RectDragPoint
    sepoint: RectDragPoint
    nwRotatePoint: RotatePoint
    neRotatePoint: RotatePoint
    swRotatePoint: RotatePoint
    seRotatePoint: RotatePoint
    bboxRaw: Rect2D
    selectSvgElements: SVGGraphicsElement[]
    onResize: () => void
    constructor(svgRoot: SVGSVGElement, svgEditorContext: SvgEditorContextType, selectedElements: SVGGraphicsElement[], onResize: () => void) {
        this.selectSvgElements = selectedElements
        this.onResize = onResize
        this.nwpoint = new RectDragPoint(svgRoot, (p) => {
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
        }, this.onTransformEnd, 'nw')
        this.nepoint = new RectDragPoint(svgRoot, (p) => {
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
        }, this.onTransformEnd, 'ne')
        this.swpoint = new RectDragPoint(svgRoot, p => {
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
        }, this.onTransformEnd, 'sw')
        this.sepoint = new RectDragPoint(svgRoot, p => {
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
        }, this.onTransformEnd, 'se')
        this.nwRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, () => { }, 'nw')
        this.neRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, () => { }, 'ne')
        this.swRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, () => { }, 'sw')
        this.seRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, () => { }, 'se')
    }

    onRotate = (degree: number) => {
        this.selectSvgElements.forEach(elm => {
            let bbox = elm.getBBox()
            setTransform(elm, { rotation: degree, xOrigin: bbox.x + bbox.width / 2, yOrigin: bbox.y + bbox.height / 2 })
        })
        this.onResize()
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

    getLocations(): {
        center: Point2D
        nwPosition: Point2D
        nePosition: Point2D
        swPosition: Point2D
        sePosition: Point2D
    } {
        return {
            center: { x: this.bboxRaw.x + this.bboxRaw.width / 2, y: this.bboxRaw.y + this.bboxRaw.height / 2 },
            nwPosition: { x: this.bboxRaw.x, y: this.bboxRaw.y },
            nePosition: { x: this.bboxRaw.x + this.bboxRaw.width, y: this.bboxRaw.y },
            swPosition: { x: this.bboxRaw.x, y: this.bboxRaw.y + this.bboxRaw.height },
            sePosition: { x: this.bboxRaw.x + this.bboxRaw.width, y: this.bboxRaw.y + this.bboxRaw.height }
        }
    }

    setTransform(bboxRaw: Rect2D, rotation: number) {
        this.bboxRaw = bboxRaw
        let { center, nwPosition, nePosition, swPosition, sePosition } = this.getLocations()
        this.nwpoint.setPosition(nwPosition, center, rotation)
        this.nepoint.setPosition(nePosition, center, rotation)
        this.swpoint.setPosition(swPosition, center, rotation)
        this.sepoint.setPosition(sePosition, center, rotation)
        this.nwRotatePoint.setPosition(nwPosition, center, rotation)
        this.neRotatePoint.setPosition(nePosition, center, rotation)
        this.swRotatePoint.setPosition(swPosition, center, rotation)
        this.seRotatePoint.setPosition(sePosition, center, rotation)
    }

    hide() {
        this.nwpoint.hide()
        this.nepoint.hide()
        this.swpoint.hide()
        this.sepoint.hide()
        this.nwRotatePoint.hide()
        this.neRotatePoint.hide()
        this.swRotatePoint.hide()
        this.seRotatePoint.hide()
    }

    show() {
        this.nwpoint.show()
        this.nepoint.show()
        this.swpoint.show()
        this.sepoint.show()
        this.nwRotatePoint.show()
        this.neRotatePoint.show()
        this.swRotatePoint.show()
        this.seRotatePoint.show()
    }

    componentWillUnmount() {
        this.nwpoint.componentWillUnmount()
        this.nepoint.componentWillUnmount()
        this.swpoint.componentWillUnmount()
        this.sepoint.componentWillUnmount()
    }
}