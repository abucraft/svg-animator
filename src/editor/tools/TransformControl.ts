import { RectDragPoint, RotateLocation, transformRotateLocation } from "./DragPoint";
import { dispatch } from "../../core/Store";
import { updateSvgAttribute, selectSvgElement } from "../../core/Actions";
import { getAttributes, setAttributes, setTransform, getTransform, getCenterRotateOrigin } from "../../utils/Utils";
import { RotatePoint } from "./RotatePoint";
import { fromRotation, degree2Rad, invert, multiplyVec3, transpose, fromRotationOrigin, rotate } from "../../utils/mat3";
import { EditorToolContextType } from "../EditorToolContext";

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
    constructor(
        svgRoot: SVGSVGElement, 
        svgEditorContext: SvgEditorContextType, 
        editorToolContext: EditorToolContextType,
        onResize: () => void) {
        this.rotation = 0
        this.onResize = onResize
        this.nwpoint = new RectDragPoint(svgRoot, svgEditorContext, editorToolContext, this.onResizeElement('nw'), this.onResizeEnd, 'nw')
        this.nepoint = new RectDragPoint(svgRoot, svgEditorContext, editorToolContext, this.onResizeElement('ne'), this.onResizeEnd, 'ne')
        this.swpoint = new RectDragPoint(svgRoot, svgEditorContext, editorToolContext, this.onResizeElement('sw'), this.onResizeEnd, 'sw')
        this.sepoint = new RectDragPoint(svgRoot, svgEditorContext, editorToolContext, this.onResizeElement('se'), this.onResizeEnd, 'se')
        this.nwRotatePoint = new RotatePoint(svgRoot, svgEditorContext, editorToolContext, this.onRotate, this.onRotateEnd, 'nw')
        this.neRotatePoint = new RotatePoint(svgRoot, svgEditorContext, editorToolContext, this.onRotate, this.onRotateEnd, 'ne')
        this.swRotatePoint = new RotatePoint(svgRoot, svgEditorContext, editorToolContext, this.onRotate, this.onRotateEnd, 'sw')
        this.seRotatePoint = new RotatePoint(svgRoot, svgEditorContext, editorToolContext, this.onRotate, this.onRotateEnd, 'se')
    }

    setSelectedElements(selectedElements: SVGGraphicsElement[]) {
        this.selectSvgElements = selectedElements
    }

    onResizeElement = (_location: RotateLocation) => (p: DeltaPoint2D) => {
        let reverseMat = new Array(9)
        fromRotation(reverseMat, degree2Rad(this.rotation))
        invert(reverseMat, reverseMat)
        let targetVec = [p.dx, p.dy, 1]
        multiplyVec3(targetVec, reverseMat, targetVec)
        let dx = targetVec[0]
        let dy = targetVec[1]
        let location = _location// transformRotateLocation(_location, this.rotation)
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
                let transform = getTransform(elm)
                let transformX = transform.x
                let transformY = transform.y
                setTransform(elm, { x: transformX + p.dx / 2, y: transformY + p.dy / 2, rotation: this.rotation, xOrigin: bbox.x + bbox.width / 2, yOrigin: bbox.y + bbox.height / 2 })
            }
            if (elm.nodeName == "rect") {
                let { x, y, width, height } = getAttributes(elm, { x: 'number', y: 'number', width: 'number', height: 'number' })
                switch (location) {
                    case 'nw':
                        x += dx
                        y += dy
                        width -= dx
                        height -= dy
                        break;
                    case 'ne':
                        width = width + dx
                        y = y + dy
                        height -= dy
                        break;
                    case "sw":
                        x = x + dx
                        width -= dx
                        height = height + dy
                        break;
                    case 'se':
                        width += dx
                        height += dy
                        break;
                }
                setAttributes(elm, { x, y, height, width })
                let bbox = elm.getBBox()
                let transform = getTransform(elm)
                let transformX = transform.x
                let transformY = transform.y
                setTransform(elm, { x: transformX + (p.dx - dx) / 2, y: transformY + (p.dy - dy) / 2, rotation: this.rotation, xOrigin: bbox.x + bbox.width / 2, yOrigin: bbox.y + bbox.height / 2 })
            }
            if (elm.nodeName == "path") {
                let bbox = elm.getBBox()
                let transform = getTransform(elm)
                let scaleX = transform.scaleX
                let scaleY = transform.scaleY
                let transformX = transform.x
                let transformY = transform.y
                let realWidth = bbox.width * scaleX
                let realHeight = bbox.height * scaleY
                let right = bbox.x + bbox.width
                let bottom = bbox.y + bbox.height
                let newScaleX = 1
                let newScaleY = 1
                let v1, v2, rotateOrigin1, rotateOrigin2, rotateMat1, rotateMat2
                switch (location) {
                    case 'nw':
                        newScaleX = ((realWidth - dx) / realWidth) * scaleX
                        newScaleY = ((realHeight - dy) / realHeight) * scaleY
                        v1 = [bbox.x * scaleX, bbox.y * scaleY, 1]
                        v2 = [bbox.x * newScaleX, bbox.y * newScaleY, 1]
                        break;
                    case 'ne':
                        newScaleX = ((realWidth + dx) / realWidth) * scaleX
                        newScaleY = ((realHeight - dy) / realHeight) * scaleY
                        v1 = [right * scaleX, bbox.y * scaleY, 1]
                        v2 = [right * newScaleX, bbox.y * newScaleY, 1]
                        break;
                    case "sw":
                        newScaleX = ((realWidth - dx) / realWidth) * scaleX
                        newScaleY = ((realHeight + dy) / realHeight) * scaleY
                        v1 = [bbox.x * scaleX, bottom * scaleY, 1]
                        v2 = [bbox.x * newScaleX, bottom * newScaleY, 1]
                        break;
                    case "se":
                        newScaleX = ((realWidth + dx) / realWidth) * scaleX
                        newScaleY = ((realHeight + dy) / realHeight) * scaleY
                        v1 = [right * scaleX, bottom * scaleY, 1]
                        v2 = [right * newScaleX, bottom * newScaleY, 1]
                        break;
                }
                rotateOrigin1 = getCenterRotateOrigin(bbox, scaleX, scaleY)
                rotateOrigin2 = getCenterRotateOrigin(bbox, newScaleX, newScaleY)
                rotateMat1 = fromRotationOrigin(degree2Rad(this.rotation), rotateOrigin1.xOrigin, rotateOrigin1.yOrigin)
                rotateMat2 = fromRotationOrigin(degree2Rad(this.rotation), rotateOrigin2.xOrigin, rotateOrigin2.yOrigin)
                multiplyVec3(v1, rotateMat1, v1)
                multiplyVec3(v2, rotateMat2, v2)
                transformX = (v1[0] + transformX + p.dx) - v2[0]
                transformY = (v1[1] + transformY + p.dy) - v2[1]
                let newTransform = { x: transformX, y: transformY, scaleX: newScaleX, scaleY: newScaleY, ...getCenterRotateOrigin(bbox, newScaleX, newScaleY) }
                setTransform(elm, newTransform)
            }
        })
        this.onResize()
    }

    onRotate = (degree: number) => {
        this.rotation = degree
        // console.log("rotation", degree)
        this.selectSvgElements.forEach(elm => {
            let bbox = elm.getBBox()
            let transform = getTransform(elm)
            setTransform(elm, { rotation: degree, ...getCenterRotateOrigin(bbox, transform.scaleX, transform.scaleY) })
        })
        this.onResize()
    }

    onRotateEnd = () => {
        let attributesMap: AttrUpdateMap = {}
        this.selectSvgElements.forEach(elm => {
            attributesMap[elm.id] = {
                attributes: {},
                transform: getTransform(elm)
            }
        })
        dispatch(updateSvgAttribute(attributesMap))
    }

    onResizeEnd = () => {
        let attributesMap: AttrUpdateMap = {}
        this.selectSvgElements.forEach(elm => {
            attributesMap[elm.id] = {}
            if (elm.nodeName === 'ellipse') {
                attributesMap[elm.id].attributes = getAttributes(elm, { rx: 'number', ry: 'number' })
            }
            if (elm.nodeName === 'rect') {
                attributesMap[elm.id].attributes = getAttributes(elm, { x: 'number', y: 'number', width: 'number', height: 'number' })
            }
            let transform = getTransform(elm)
            attributesMap[elm.id].transform = {
                x: transform.x,
                y: transform.y,
                rotation: transform.rotation,
                xOrigin: transform.xOrigin,
                yOrigin: transform.yOrigin,
                scaleX: transform.scaleX,
                scaleY: transform.scaleY
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
        this.rotation = rotation
        let { center, nwPosition, nePosition, swPosition, sePosition } = this.getLocations()
        this.nwpoint.setPosition(nwPosition, center, rotation)
        this.nwpoint.location = transformRotateLocation("nw", rotation)
        this.nepoint.setPosition(nePosition, center, rotation)
        this.nepoint.location = transformRotateLocation("ne", rotation)
        this.swpoint.setPosition(swPosition, center, rotation)
        this.swpoint.location = transformRotateLocation("sw", rotation)
        this.sepoint.setPosition(sePosition, center, rotation)
        this.sepoint.location = transformRotateLocation("se", rotation)
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