type GSTransfrom = {
    force3D?: string
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
    xOffset?: number
    y?: number
    yOrigin?: number
    yPercent?: number
    yOffset?: number
    z?: number
    zOrigin?: number
}
interface HTMLElement {
    _gsTransform?: GSTransfrom
}

interface SVGElement {
    _gsTransform?: GSTransfrom
}