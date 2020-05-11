import { domPaser, setAttributes, setTransform, SVG_XMLNS } from "../../utils/Utils";
import { fromRotation, degree2Rad, multiplyVec3 } from "../../utils/mat3";
import { EditorToolContextType } from "../EditorToolContext";

export type DragCursor = 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize'
export type RotateLocation = 'nw' | 'ne' | 'sw' | 'se'


// using degree to apply location
export function transformRotateLocation(location: RotateLocation, rotation: number): RotateLocation {
    const locationArray: RotateLocation[] = ["nw", "ne", "se", "sw"]
    const startIndex = locationArray.indexOf(location)
    const delta = Math.floor((rotation + 45) / 90)
    const endIndex = (startIndex + delta) % 4;
    return locationArray[endIndex]
}
export abstract class BasePoint {
    svgRoot: SVGSVGElement
    point: SVGElement
    mousePosition: Point2D
    pointPosition: Point2D
    degree: number
    center: Point2D
    pointSize = 4
    _location: RotateLocation
    constructor(
        svgRoot: SVGSVGElement,
        location: RotateLocation) {
        this._location = location
        this.svgRoot = svgRoot
        this.point = this.createPoint()
        this.svgRoot.append(this.point)
    }

    get location() {
        return this._location
    }

    set location(newLoc: RotateLocation) {
        this._location = newLoc
        this.point.setAttribute("style", `cursor:${this._location}-resize;`)
    }

    abstract createPoint(): SVGElement

    setPosition(position: Point2D, center: Point2D, degree: number): void {
        this.pointPosition = position;
        this.center = center
        this.degree = degree
        setTransform(this.point, this.caculateTransform());
    }


    caculateTransform(): Transform {
        // rotate position around center by degree
        let vec = [this.pointPosition.x - this.center.x, this.pointPosition.y - this.center.y, 1]
        let rotateMat = new Array(9);
        fromRotation(rotateMat, degree2Rad(this.degree))
        multiplyVec3(vec, rotateMat, vec)
        return {
            x: this.center.x + vec[0],
            y: this.center.y + vec[1],
            rotation: this.degree
        }
    }

}

abstract class BaseDragPoint extends BasePoint {
    onMove: (p: DeltaPoint2D) => void
    onMoveEnd: () => void
    svgEditorContext: SvgEditorContextType
    editorToolContext: EditorToolContextType
    constructor(svgRoot: SVGSVGElement,
        svgEditorContext: SvgEditorContextType,
        editorToolContext: EditorToolContextType,
        onMove: (p: DeltaPoint2D) => void,
        onMoveEnd: () => void,
        location: RotateLocation) {
        super(svgRoot, location)
        this.svgEditorContext = svgEditorContext
        this.editorToolContext = editorToolContext
        this.point.addEventListener('mousedown', this.onMouseDown)
        this.point.addEventListener('click', this.onClick)
        this.onMove = onMove
        this.onMoveEnd = onMoveEnd
    }

    abstract createPoint(): SVGElement

    onClick = (event: MouseEvent) => {
        event.stopPropagation()
    }

    onMouseDown = (event: MouseEvent) => {
        event.stopPropagation()
        this.editorToolContext.eventLocked = true
        this.mousePosition = { x: event.clientX, y: event.clientY }
        this.pointPosition = { x: parseFloat(this.point.getAttribute('cx')), y: parseFloat(this.point.getAttribute('cy')) }
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        let delta = { dx: event.clientX - this.mousePosition.x, dy: event.clientY - this.mousePosition.y }
        this.mousePosition = { x: event.x, y: event.y }
        let pointPosition = { x: this.pointPosition.x + delta.dx, y: this.pointPosition.y + delta.dy }
        this.pointPosition = pointPosition
        setAttributes(this.point, { cx: this.pointPosition.x, cy: this.pointPosition.y })
        this.onMove(delta)
    }

    onMouseUp = (event: MouseEvent) => {
        event.stopPropagation()
        this.editorToolContext.eventLocked = false
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        this.onMoveEnd()
    }

    hide() {
        this.point.remove()
    }

    show() {
        this.svgRoot.append(this.point)
    }

    componentWillUnmount() {
        this.point.remove();
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
    }
}


export function createCircle(): SVGCircleElement {
    return domPaser.parseFromString(`<circle xmlns="${SVG_XMLNS}" cx="0" cy="0" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as SVGCircleElement
}

export class CircleDragPoint extends BaseDragPoint {
    createPoint(): SVGElement {
        var circle = createCircle()
        circle.setAttribute("style", `cursor:${this._location}-resize;`)
        circle.setAttribute('r', this.pointSize.toString())
        return circle
    }
}


export class RectDragPoint extends BaseDragPoint {
    createPoint(): SVGElement {
        return domPaser.parseFromString(`<rect xmlns="${SVG_XMLNS}" style="cursor:${this._location}-resize;" x="${-this.pointSize}" y="${-this.pointSize}" width="${this.pointSize * 2}" height="${this.pointSize * 2}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
    }
}