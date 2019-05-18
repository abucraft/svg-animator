import { domPaser, setAttributes } from "../../utils/Utils";

type DragCursor = 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize'


abstract class BaseDragPoint {
    svgRoot: SVGSVGElement
    onMove: (p: DeltaPoint2D) => void
    onMoveEnd: () => void
    point: SVGElement
    mousePosition: Point2D
    pointPosition: Point2D
    pointSize = 4
    cursor: DragCursor
    constructor(svgRoot: SVGSVGElement,
        position: Point2D,
        onMove: (p: DeltaPoint2D) => void,
        onMoveEnd: () => void,
        cursor: DragCursor) {
        this.pointPosition = position
        this.cursor = cursor
        this.svgRoot = svgRoot
        this.point = this.createPoint()
        this.svgRoot.append(this.point)
        this.point.addEventListener('mousedown', this.onMouseDown)
        this.point.addEventListener('click', this.onClick)
        this.onMove = onMove
        this.onMoveEnd = onMoveEnd
    }

    abstract createPoint(): SVGElement
    abstract setPosition(position: Point2D): void

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
        return domPaser.parseFromString(`<circle xmlns="http://www.w3.org/2000/svg" style="cursor:${this.cursor};" cx="${this.pointPosition.x}" cy="${this.pointPosition.y}" r="${this.pointSize}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
    }

    setPosition(position: Point2D) {
        setAttributes(this.point, { cx: position.x, cy: position.y })
    }
}


export class RectDragPoint extends BaseDragPoint {
    createPoint(): SVGElement {
        return domPaser.parseFromString(`<rect xmlns="http://www.w3.org/2000/svg" style="cursor:${this.cursor};" x="${this.pointPosition.x - this.pointSize}" y="${this.pointPosition.y - this.pointSize}" width="${this.pointSize * 2}" height="${this.pointSize * 2}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
    }
    setPosition(position: Point2D): void {
        setAttributes(this.point, { x: position.x - this.pointSize, y: position.y - this.pointSize })
    }


}