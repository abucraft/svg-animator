import { domPaser, setAttributes, pointsToLinePath, setTransform } from "../../utils/Utils";
import './RotatePoint.css'
import { fromRotation, vec3Multiply, degree2Rad, rat2Degree } from "../../utils/mat3";

type RotateLocation = 'nw' | 'ne' | 'sw' | 'se'

export class RotatePoint {
    svgRoot: SVGSVGElement
    svgEditorContext: SvgEditorContextType
    onRotate: (degree: number) => void
    onRotateEnd: () => void
    point: SVGElement
    mousePosition: Point2D
    pointPosition: Point2D
    degree: number
    center: Point2D
    pointSize = 4
    location: RotateLocation
    constructor(
        svgRoot: SVGSVGElement,
        svgEditorContext: SvgEditorContextType,
        position: Point2D,
        center: Point2D,
        degree: number,
        onRotate: (degree: number) => void,
        onRotateEnd: () => void,
        rotateLocation: RotateLocation) {
        this.pointPosition = position
        this.center = center
        this.degree = degree
        this.svgRoot = svgRoot
        this.svgEditorContext = svgEditorContext
        this.location = rotateLocation
        this.point = this.createPoint()
        this.svgRoot.append(this.point)
        this.point.addEventListener('mousedown', this.onMouseDown)
        this.point.addEventListener('click', this.onClick)
        this.onRotate = onRotate
        this.onRotateEnd = onRotateEnd
    }

    createPoint(): SVGElement {
        let points: Point2D[] = [{ x: 0 - this.pointSize, y: 0 - this.pointSize },
        { x: 0 - this.pointSize, y: 0 + this.pointSize },
        { x: 0 - this.pointSize * 3, y: 0 + this.pointSize },
        { x: 0 - this.pointSize * 3, y: 0 - this.pointSize * 3 },
        { x: 0 + this.pointSize, y: 0 - this.pointSize * 3 },
        { x: 0 + this.pointSize, y: 0 - this.pointSize },
        { x: 0 - this.pointSize, y: 0 - this.pointSize }]
        switch (this.location) {
            case "ne":
                points = this.rotatePoints(points, 90)
                break;
            case "se":
                points = this.rotatePoints(points, 180)
                break;
            case "sw":
                points = this.rotatePoints(points, 270)
                break;
        }
        var path = domPaser.parseFromString(`<path xmlns="http://www.w3.org/2000/svg" class="rotate-point" d="${pointsToLinePath(points)}" vector-effect="non-scaling-stroke" stroke="black" stroke-width="0.5px" fill="white"/>`, "image/svg+xml").firstChild as any as SVGElement
        setTransform(path, this.caculateTransform())
        return path
    }

    rotatePoints(points: Point2D[], degree: number): Point2D[] {
        let rotateMat = new Array(9);
        fromRotation(rotateMat, degree2Rad(degree));
        return points.map(point => {
            let vec = [point.x, point.y, 1]
            vec3Multiply(vec, vec, rotateMat)
            return {
                x: vec[0],
                y: vec[1]
            }
        })
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
            rotate: {
                degree: this.degree,
                centerX: 0,
                centerY: 0
            }
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
        this.svgEditorContext.eventLocked = true
        this.mousePosition = { x: event.clientX, y: event.clientY }
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
        return false
    }

    onMouseMove = (event: MouseEvent) => {
        let clientCenter = this.getClientCenter()
        let rad1 = Math.atan2(this.mousePosition.y - clientCenter.y, this.mousePosition.x - clientCenter.x)
        let rad2 = Math.atan2(event.clientY - clientCenter.y, event.clientX - clientCenter.x)
        let delta = rat2Degree(rad2 - rad1)
        let newDegree = this.degree + delta
        this.onRotate(newDegree)
        this.setDegree(newDegree)
        this.mousePosition = { x: event.x, y: event.y }
    }

    onMouseUp = (event: MouseEvent) => {
        event.stopPropagation()
        setTimeout(() => this.svgEditorContext.eventLocked = false, 0)
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        this.onRotateEnd()
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