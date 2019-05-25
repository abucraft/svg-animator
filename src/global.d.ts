type GSTransfrom = {
    perspective?: number
    rotation?: number
    rotationX?: number
    rotationY?: number
    scaleX?: number
    scaleY?: number
    scaleZ?: number
    skewType?: string
    skewX?: number
    skewY?: number
    svg?: boolean
    x?: number
    xOrigin?: number
    xPercent?: number
    y?: number
    yOrigin?: number
    yPercent?: number
    z?: number
    zOrigin?: number
}
interface SVGElement {
    _gsTransform?: GSTransfrom
}