import { degree2Rad, invert, multiply, multiplyVec3, fromRotation } from "../utils/mat3";

export function svgPoint2ClientPoint(pt: Point2D, svg: SVGSVGElement) {
    let viewBox = svg.viewBox
    let clientRect = svg.getClientRects()[0]
    if (viewBox.baseVal === null || // Firefox unset viewBox baseVal is null  
        viewBox.baseVal.width == 0 ||
        viewBox.baseVal.height == 0) {
        return {
            x: pt.x + clientRect.left,
            y: pt.y + clientRect.top
        }
    } else {
        return {
            x: (pt.x - viewBox.baseVal.left) * clientRect.width / viewBox.baseVal.width + clientRect.left,
            y: (pt.y - viewBox.baseVal.top) * clientRect.height / viewBox.baseVal.height + clientRect.top
        }
    }
}

export function clientPoint2SvgPoint(pt: Point2D, svg: SVGSVGElement) {
    let viewBox = svg.viewBox
    let clientRect = svg.getClientRects()[0]
    if (viewBox.baseVal === null || // Firefox unset viewBox baseVal is null  
        viewBox.baseVal.width == 0 ||
        viewBox.baseVal.height == 0) {
        return {
            x: pt.x - clientRect.left,
            y: pt.y - clientRect.top
        }
    } else {
        return {
            x: (pt.x - clientRect.left) * viewBox.baseVal.width / clientRect.width + viewBox.baseVal.left,
            y: (pt.y - clientRect.top) * viewBox.baseVal.height / clientRect.height + viewBox.baseVal.top
        }
    }
}


// reverse the point by unapply the transform
export function unapplyTransform(pt: Point2D, transform: Transform) {
    // TODO: take scale into consideration, scale should also have origin
    let scaleX = transform.scaleX !== undefined ? transform.scaleX : 1
    let scaleY = transform.scaleY !== undefined ? transform.scaleY : 1

    let translateX = transform.x !== undefined ? transform.x : 0
    let translateY = transform.y !== undefined ? transform.y : 0
    let rotate = transform.rotation !== undefined ? transform.rotation : 0;
    let xOrigin = transform.xOrigin !== undefined ? transform.xOrigin : 0
    let yOrigin = transform.yOrigin !== undefined ? transform.yOrigin : 0
    let reverseMat = [
        1, 0, -xOrigin,
        0, 1, -yOrigin,
        0, 0, 1
    ]
    let rotateMat = new Array(9)
    fromRotation(rotateMat, degree2Rad(rotate))
    multiply(rotateMat, rotateMat, reverseMat)
    multiply(rotateMat,
        [
            1, 0, xOrigin,
            0, 1, yOrigin,
            0, 0, 1
        ], rotateMat);

    multiply(rotateMat,
        [
            1, 0, translateX,
            0, 1, translateY,
            0, 0, 1
        ], rotateMat)
    // console.log("last mat", rotateMat)

    invert(rotateMat, rotateMat)

     console.log("inverted mat", rotateMat)

    let ptVec = [pt.x, pt.y, 1]

    multiplyVec3(ptVec, rotateMat, ptVec)

    console.log("original point", pt);
    console.log("transformed", ptVec)
    return {
        x: ptVec[0],
        y: ptVec[1]
    }
}