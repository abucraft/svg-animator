import { RectDragPoint, RotateLocation } from "./DragPoint";
import { dispatch } from "../../core/Store";
import { updateSvgAttribute, selectSvgElement } from "../../core/Actions";
import { getAttributes, setAttributes, setTransform } from "../../utils/Utils";
import { RotatePoint } from "./RotatePoint";
import { fromRotation, degree2Rad, invert, vec3Multiply } from "../../utils/mat3";

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
    rotation: number
    selectSvgElements: SVGGraphicsElement[]
    onResize: () => void
    constructor(svgRoot: SVGSVGElement, svgEditorContext: SvgEditorContextType, selectedElements: SVGGraphicsElement[], onResize: () => void) {
        this.selectSvgElements = selectedElements
        this.rotation = 0
        this.onResize = onResize
        this.nwpoint = new RectDragPoint(svgRoot, this.onResizeElement('nw'), this.onResizeEnd, 'nw')
        this.nepoint = new RectDragPoint(svgRoot, this.onResizeElement('ne'), this.onResizeEnd, 'ne')
        this.swpoint = new RectDragPoint(svgRoot, this.onResizeElement('sw'), this.onResizeEnd, 'sw')
        this.sepoint = new RectDragPoint(svgRoot, this.onResizeElement('se'), this.onResizeEnd, 'se')
        this.nwRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, this.onRotateEnd, 'nw')
        this.neRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, this.onRotateEnd, 'ne')
        this.swRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, this.onRotateEnd, 'sw')
        this.seRotatePoint = new RotatePoint(svgRoot, svgEditorContext, this.onRotate, this.onRotateEnd, 'se')
    }

    onResizeElement = (location: RotateLocation) => (p: DeltaPoint2D) => {
        let reverseMat = new Array(9)
        fromRotation(reverseMat, degree2Rad(this.rotation))
        invert(reverseMat, reverseMat)
        let targetVec = [p.dx, p.dy, 1]
        vec3Multiply(targetVec, targetVec, reverseMat)
        let dx = targetVec[0]
        let dy = targetVec[1]
        this.selectSvgElements.forEach(elm => {
            if (elm.nodeName === 'ellipse') {
                let { rx, ry } = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                switch (location) {
                    case "nw":
                        rx = rx - (dx / 2)
                        ry = ry - (dy / 2)
                        break;
                    case "ne":
                        rx = rx + (dx / 2)
                        ry = ry - (dy / 2)
                        break;
                    case 'sw':
                        rx = rx - (dx / 2)
                        ry = ry + (dy / 2)
                        break;
                    case 'se':
                        rx = rx + (dx / 2)
                        ry = ry + (dy / 2)
                        break;
                }
                setAttributes(elm, { rx, ry })
                let bbox = elm.getBBox()
                let transformX = elm._gsTransform.x || 0
                let transformY = elm._gsTransform.y || 0
                setTransform(elm, { x: transformX + p.dx / 2, y: transformY + p.dy / 2, rotation: this.rotation, xOrigin: bbox.x + bbox.width / 2, yOrigin: bbox.y + bbox.height / 2 })
            }
        })
        this.onResize()
    }

    onRotate = (degree: number) => {
        this.rotation = degree
        this.selectSvgElements.forEach(elm => {
            let bbox = elm.getBBox()
            setTransform(elm, { rotation: degree, xOrigin: bbox.x + bbox.width / 2, yOrigin: bbox.y + bbox.height / 2 })
        })
        this.onResize()
    }

    onRotateEnd = () => {
        let attributesMap: AttributesAndTransform = {}
        this.selectSvgElements.forEach(elm => {
            attributesMap[elm.id] = {
                attributes: {},
                transform: {
                    x: elm._gsTransform.x,
                    y: elm._gsTransform.y,
                    rotation: elm._gsTransform.rotation,
                    xOrigin: elm._gsTransform.xOrigin,
                    yOrigin: elm._gsTransform.yOrigin
                }
            }
        })
        dispatch(updateSvgAttribute(attributesMap))
    }

    onResizeEnd = () => {
        let attributesMap: AttributesAndTransform = {}
        this.selectSvgElements.forEach(elm => {
            if (elm.nodeName === 'ellipse') {
                let attributes = getAttributes(elm, { rx: 'number', ry: 'number' })
                attributesMap[elm.id] = {
                    attributes,
                    transform: {
                        x: elm._gsTransform.x,
                        y: elm._gsTransform.y,
                        rotation: elm._gsTransform.rotation,
                        xOrigin: elm._gsTransform.xOrigin,
                        yOrigin: elm._gsTransform.yOrigin
                    }
                }
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