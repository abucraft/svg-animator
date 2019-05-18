import { domPaser, setAttributes, pointsToLinePath, setTransform } from "../../utils/Utils";
import './RotatePoint.css'
import { fromRotation, vec3Multiply, degree2Rad, rat2Degree } from "../../utils/mat3";

type RotateLocation = 'nw' | 'ne' | 'sw' | 'se'

export class RotatePoint {
    svgRoot: SVGSVGElement
    onMove: (p: DeltaPoint2D) => void
    onMoveEnd: () => void
    point: SVGElement
    mousePosition: Point2D
    pointPosition: Point2D
    degree: number
    center: Point2D
    pointSize = 4
    location: RotateLocation
    constructor(svgRoot: SVGSVGElement,
        position: Point2D,
        center: Point2D,
        degree: number,
        onMove: (p: DeltaPoint2D) => void,
        onMoveEnd: () => void,
        rotateLocation: RotateLocation) {
        this.pointPosition = position
        this.center = center
        this.degree = degree
        this.svgRoot = svgRoot
        this.location = rotateLocation
        this.point = this.createPoint()
        this.svgRoot.append(this.point)
        this.point.addEventListener('mousedown', this.onMouseDown)
        this.point.addEventListener('click', this.onClick)
        this.onMove = onMove
        this.onMoveEnd = onMoveEnd
    }

    createPoint(): SVGElement {
        let points: Point2D[] = [{ x: 0 - this.pointSize, y: 0 - this.pointSize },
        { x: 0 - this.pointSize, y: 0 + this.pointSize },
        { x: 0 - this.pointSize * 3, y: 0 + this.pointSize },
        { x: 0 - this.pointSize * 3, y: 0 - this.pointSize * 3 },
        { x: 0 + this.pointSize, y: 0 - this.pointSize * 3 },
        { x: 0 + this.pointSize, y: 0 - this.pointSize },
        { x: 0 - this.pointSize, y: 0 - this.pointSize }]
        var path = domPaser.parseFromString(`<path xmlns="http://www.w3.org/2000/svg" class="rotate-point" d="${pointsToLinePath(points)}" vector-effect="non-scaling-stroke" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
        setTransform(path, this.caculateTransform())
        return path
    }

    caculateTransform(): Transform {
        // rotate position around center by degree
        let vec = [this.pointPosition.x - this.center.x, this.pointPosition.y - this.center.y, 1]
        let rotateMat = new Array(9);
        fromRotation(rotateMat, degree2Rad(this.degree))
        vec3Multiply(vec, vec, rotateMat)
        let newPoint = {
            x: this.center.x + vec[0],
            y: this.center.y + vec[1]
        }
        return {
            translate: newPoint,
            rotateDegree: this.degree
        }
    }

    getClientCenter(): Point2D {
        let viewBox = this.svgRoot.viewBox
        let clientRect = this.svgRoot.getClientRects()[0]
        if (viewBox.baseVal.width == 0 || viewBox.baseVal.height == 0) {
            return {
                x: this.center.x + clientRect.left,
                y: this.center.y + clientRect.top
            }
        } else {
            return {
                x: (this.center.x - viewBox.baseVal.left) * clientRect.width / viewBox.baseVal.width + clientRect.left,
                y: (this.center.y - viewBox.baseVal.top) * clientRect.height / viewBox.baseVal.height + clientRect.top
            }
        }

    }

    setPosition(position: Point2D, center: Point2D, degree: number): void {
        this.pointPosition = position;
        this.center = center
        this.degree = degree
        setTransform(this.point, this.caculateTransform());
    }

    setDegree(degree: number) {
        this.degree = degree
        setTransform(this.point, this.caculateTransform())
    }

    onClick = (event: MouseEvent) => {
        event.stopPropagation()
    }

    onMouseDown = (event: MouseEvent) => {
        event.stopPropagation()
        this.mousePosition = { x: event.clientX, y: event.clientY }
        window.addEventListener("click", this.onClick, true)
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
        return false
    }

    onMouseMove = (event: MouseEvent) => {
        let clientCenter = this.getClientCenter()
        let rad1 = Math.atan2(this.mousePosition.y - clientCenter.y, this.mousePosition.x - clientCenter.x)
        let rad2 = Math.atan2(event.clientY - clientCenter.y, event.clientX - clientCenter.x)
        let delta = rat2Degree(rad2 - rad1)
        console.log(delta, clientCenter, rad1, rad2)
        this.setDegree(this.degree + delta)
        this.mousePosition = { x: event.x, y: event.y }
        setAttributes(this.point, { cx: this.pointPosition.x, cy: this.pointPosition.y })
    }

    onMouseUp = (event: MouseEvent) => {
        event.stopPropagation()
        setTimeout(() => window.removeEventListener("click", this.onClick, true), 0)
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        this.onMoveEnd()
        return false
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