import { domPaser, setAttributes } from "../../utils/Utils";

type DragCursor = 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize'

export class DragPoint {
    svgRoot: SVGSVGElement
    onMove: (p: DeltaPoint2D) => void
    onMoveEnd: () => void
    point: SVGRectElement
    mousePosition: Point2D
    pointPosition: Point2D
    pointSize = 4
    constructor(svgRoot: SVGSVGElement,
        position: Point2D,
        onMove: (p: DeltaPoint2D) => void,
        onMoveEnd: () => void,
        cursor: DragCursor) {
        this.pointPosition = position
        this.point = domPaser.parseFromString(`<circle xmlns="http://www.w3.org/2000/svg" style="cursor:${cursor};" cx="${position.x}" cy="${position.y}" r="${this.pointSize}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGRectElement
        this.svgRoot = svgRoot
        this.svgRoot.append(this.point)
        this.point.addEventListener('mousedown', this.onMouseDown)
        this.point.addEventListener('click', this.onClick)
        this.onMove = onMove
        this.onMoveEnd = onMoveEnd
    }

    onClick = (event: MouseEvent) => {
        event.stopPropagation()
    }

    setPosition(position: Point2D) {
        setAttributes(this.point, { cx: position.x, cy: position.y })
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