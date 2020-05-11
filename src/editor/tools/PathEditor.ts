import React, { Component } from 'react'
import { createCircle } from './DragPoint';
import { setAttributes, deepCopy, SVG_XMLNS, pointsToLinePath, setTransform, getCenterRotateOrigin } from '../../utils/Utils';
import { clientPoint2SvgPoint, unapplyTransform } from '../Utils';
import { WithSvgEditorContext } from '../../app/SvgEditorContext';

type PathEditorProps = {
    svgRoot: SVGSVGElement
} & SvgEditorContextComponentProps

type PathEditorState = {
    selectedElements: Array<SVGGraphicsElement>
}

class PathEditor extends Component<PathEditorProps, PathEditorState>{
    pathCreation: PathCreation
    componentDidMount() {
        let selectedElementIds = this.props.editorContext.selectedElementIds
        if (this.props.editorContext.editMode === "path-creating" && selectedElementIds.length > 0) {
            this.createPathCreation()
        }
    }

    componentDidUpdate(prevProps: PathEditorProps) {
        if (prevProps.editorContext.editMode !== this.props.editorContext.editMode) {
            if (this.props.editorContext.editMode === "path-creating") {
                if (this.pathCreation !== null) {
                    console.error("Path Creation is not empty while switching to creating", this.pathCreation)
                    this.pathCreation.clear()
                    this.pathCreation = null
                }
                this.createPathCreation()
            }
        } else {
            let oldInitState = this.getInitState(prevProps.editorContext.svgStates, this.props.editorContext.selectedElementIds[0])
            let newInitState = this.getInitState(this.props.editorContext.svgStates, this.props.editorContext.selectedElementIds[0])
            if (oldInitState !== newInitState) {
                if (this.props.editorContext.editMode === "path-creating") {
                    this.pathCreation.applyNewPathPoints(newInitState.attributes["d"])
                }
            }
        }
    }

    getInitState(svgStates: SvgStateMap, id: string) {
        let state = svgStates.get(id)
        let keys = [...state.keys()]
        keys.sort((v1, v2) => v1 - v2)
        return state.get(keys[0])
    }


    createPathCreation = () => {
        let selectedElementIds = this.props.editorContext.selectedElementIds
        let initState = this.getInitState(this.props.editorContext.svgStates, selectedElementIds[0])
        let pathElm = this.props.svgRoot.getElementById(selectedElementIds[0]) as SVGPathElement
        this.pathCreation = new PathCreation(this.props.svgRoot,
            pathElm,
            initState.transform,
            initState.attributes["d"], (pts) => {
                this.props.editorContext.onUpdateSvgElement({
                    [this.props.editorContext.selectedElementIds[0]]: {
                        attributes: {
                            d: pts
                        }
                    }
                })
            }, (pts) => {
                this.props.editorContext.onUpdateSvgElement({
                    [this.props.editorContext.selectedElementIds[0]]: {
                        attributes: {
                            d: pts
                        },
                        transform: {
                            ...getCenterRotateOrigin(pathElm.getBBox(), 1, 1)
                        }
                    }
                })
                this.pathCreation.clear()
                this.pathCreation = null
                this.props.editorContext.changeEditMode("path-editing")
            })
    }

    componentWillUnmount() {
        if (this.pathCreation) {
            this.pathCreation.clear()
        }
    }

    render() {
        return null;
    }
}

export const PathEditorConnected = WithSvgEditorContext(PathEditor)

class PathCreation {
    points: Point2D[]
    pointElms: SVGCircleElement[]
    path: SVGPathElement
    svg: SVGSVGElement
    transform: Transform
    onCreateNewPoint: (pts: Point2D[]) => void
    circleRadius = 4
    constructor(svg: SVGSVGElement, path: SVGPathElement, transform: Transform, pathPoints: Point2D[], onCreateNewPoint: (pts: Point2D[]) => void, onClosePath: (pts: Point2D[]) => void) {
        this.points = [...pathPoints, deepCopy(pathPoints[pathPoints.length - 1])]
        this.transform = transform
        this.pointElms = this.points.map((pt, index) => {
            var circle = this.createCircle()
            this.updateCirclePos(circle, pt, transform)
            if (index == 0) {
                circle.addEventListener("click", () => {
                    let closedPath = [...(this.points.slice(0, this.points.length - 1)), deepCopy(this.points[0])]
                    onClosePath(closedPath)
                })
            }
            return circle
        })
        this.onCreateNewPoint = onCreateNewPoint
        this.path = path
        this.svg = svg
        this.pointElms.forEach(c => this.svg.appendChild(c))
        window.addEventListener("mousemove", this.mouseMove)
        this.svg.addEventListener("click", this.clickToCreateNew)
    }

    createCircle() {
        var circle = createCircle()
        circle.setAttribute("r", this.circleRadius.toString())
        return circle;
    }

    updateCirclePos(circle: SVGCircleElement, pt: Point2D, transform: Transform) {
        setAttributes(circle, { cx: pt.x, cy: pt.y })
        setTransform(circle, transform)
    }

    mouseMove = (event: MouseEvent) => {
        var pt = { x: event.clientX, y: event.clientY }
        var svgPt = clientPoint2SvgPoint(pt, this.svg)
        // console.log(svgPt, this.path._gsTransform)
        var elemPt = unapplyTransform(svgPt, this.path._gsTransform)
        // console.log(elemPt)
        this.applyLastPtPosition(elemPt)
    }

    // TODO: caller need to make sure new points' starting point is same as old
    applyNewPathPoints = (points: Point2D[]) => {
        this.points = [...points, deepCopy(points[points.length - 1])]
        if (this.pointElms.length > this.points.length) {
            for (var i = this.points.length; i < this.pointElms.length; i++) {
                this.pointElms[i].remove()
            }
            this.pointElms.splice(this.points.length - 1, this.pointElms.length - this.points.length)
        } else if (this.pointElms.length < this.points.length) {
            for (var i = this.pointElms.length; i < this.points.length; i++) {
                var circle = this.createCircle()
                this.pointElms.push(circle)
                this.svg.appendChild(circle)
            }
        }
        this.points.forEach((pt, index) => {
            this.updateCirclePos(this.pointElms[index], pt, this.transform)
        })
    }

    applyLastPtPosition(pt: Point2D) {
        var lastPt = this.points[this.points.length - 1]
        var lastPtElm = this.pointElms[this.pointElms.length - 1]
        lastPt.x = pt.x
        lastPt.y = pt.y
        this.path.setAttribute("d", pointsToLinePath(this.points))
        setAttributes(lastPtElm, pt)
    }

    clickToCreateNew = (event: MouseEvent) => {
        this.onCreateNewPoint(this.points)
    }

    clear() {
        this.svg.removeEventListener("click", this.clickToCreateNew)
        this.pointElms.forEach(c => c.remove())
        window.removeEventListener("mousemove", this.mouseMove)
    }
}