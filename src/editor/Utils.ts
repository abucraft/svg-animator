export function clientPoint2ViewportPoint(svgRoot: SVGSVGElement, clientPoint: Point2D): Point2D {
    let viewBox = svgRoot.viewBox
    let clientRect = svgRoot.getClientRects()[0]
    if (viewBox.baseVal === null || // Firefox unset viewBox baseVal is null  
        viewBox.baseVal.width == 0 ||
        viewBox.baseVal.height == 0) {
        return {
            x: clientPoint.x - clientRect.left,
            y: clientPoint.y - clientRect.top
        }
    } else {
        return {
            x: (clientPoint.x - clientRect.left) * viewBox.baseVal.width / clientRect.width + viewBox.baseVal.left,
            y: (clientPoint.y - clientRect.top) * viewBox.baseVal.height / clientRect.height + viewBox.baseVal.top
        }
    }

}