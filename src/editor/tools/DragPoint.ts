import { domPaser, setAttributes, setTransform } from "../../utils/Utils";
import { fromRotation, degree2Rad, vec3Multiply } from "../../utils/mat3";

export type DragCursor = 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize'
export type RotateLocation = 'nw' | 'ne' | 'sw' | 'se'
export abstract class BasePoint {
    svgRoot: SVGSVGElement
    point: SVGElement
    mousePosition: Point2D
    pointPosition: Point2D
    degree: number
    center: Point2D
    pointSize = 4
    location: RotateLocation
    constructor(
        svgRoot: SVGSVGElement,
        location: RotateLocation) {
        this.location = location
        this.svgRoot = svgRoot
        this.point = this.createPoint()
        this.svgRoot.append(this.point)
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
        vec3Multiply(vec, vec, rotateMat)
        return {
            translateX: this.center.x + vec[0],
            translateY: this.center.y + vec[1],
            rotation: this.degree
        }
    }

}

abstract class BaseDragPoint extends BasePoint {
    onMove: (p: DeltaPoint2D) => void
    onMoveEnd: () => void
    constructor(svgRoot: SVGSVGElement,
        onMove: (p: DeltaPoint2D) => void,
        onMoveEnd: () => void,
        location: RotateLocation) {
        super(svgRoot, location)
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

export class CircleDragPoint extends BaseDragPoint {
    createPoint(): SVGElement {
        return domPaser.parseFromString(`<circle xmlns="http://www.w3.org/2000/svg" style="cursor:${this.location}-resize;" cx="0" cy="0" r="${this.pointSize}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
    }
}


export class RectDragPoint extends BaseDragPoint {
    createPoint(): SVGElement {
        return domPaser.parseFromString(`<rect xmlns="http://www.w3.org/2000/svg" style="cursor:${this.location}-resize;" x="${-this.pointSize}" y="${-this.pointSize}" width="${this.pointSize * 2}" height="${this.pointSize * 2}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
    }
}