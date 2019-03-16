import { domPaser } from "../../utils/Utils";

type DragCursor = 'nw-resize' | 'ne-resize' | 'sw-resize' | 'se-resize'

export class DragPoint {
    svgRoot: SVGSVGElement
    onMove: (p: DeltaPoint2D) => void
    onMoveEnd: () => void
    point: SVGRectElement
    mousePosition: Point2D
    pointPosition: Point2D
    constructor(svgRoot: SVGSVGElement,
        position: Point2D,
        onMove: (p: DeltaPoint2D) => void,
        onMoveEnd: () => void,
        cursor: DragCursor) {
        const pointSize = 2
        this.pointPosition = position
        this.point = domPaser.parseFromString(`<rect xmlns="http://www.w3.org/2000/svg" style="cursor:${cursor};" x="${position.x - pointSize}" y="${position.y - pointSize}" width="${pointSize * 2}" height="${pointSize * 2}" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGRectElement
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
        this.point.setAttribute('x', position.x.toString())
        this.point.setAttribute('y', position.y.toString())
    }

    onMouseDown = (event: MouseEvent) => {
        event.stopPropagation()
        this.mousePosition = { x: event.clientX, y: event.clientY }
        this.pointPosition = { x: parseFloat(this.point.getAttribute('x')), y: parseFloat(this.point.getAttribute('y')) }
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        let delta = { dx: event.clientX - this.mousePosition.x, dy: event.clientY - this.mousePosition.y }
        this.mousePosition = { x: event.x, y: event.y }
        let pointPosition = { x: this.pointPosition.x + delta.dx, y: this.pointPosition.y + delta.dy }
        this.pointPosition = pointPosition
        this.point.setAttribute('x', pointPosition.x.toString())
        this.point.setAttribute('y', pointPosition.y.toString())
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