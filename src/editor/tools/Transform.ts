import { DragPoint } from "./DragPoint";
import { dispatch } from "../../core/Store";
import { updateSvgAttribute } from "../../core/Actions";
import { getAttributes, setAttributes } from "../../utils/Utils";


export class Transform {
    nwpoint: DragPoint
    nepoint: DragPoint
    swpoint: DragPoint
    sePoint: DragPoint
    bbox: Rect2D
    constructor(svgRoot: SVGSVGElement, bbox: Rect2D, selectedElements: SVGElement[], onResize: () => void) {
        this.nwpoint = new DragPoint(svgRoot, { x: bbox.x, y: bbox.y }, (p) => {
            selectedElements.forEach(elm => {
                if (elm.nodeName === 'ellipse') {
                    let { cx, cy, rx, ry } = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                    cx = cx + (p.dx / 2)
                    cy = cy + (p.dy / 2)
                    rx = rx - (p.dx / 2)
                    ry = ry - (p.dy / 2)
                    setAttributes(elm, { cx, cy, rx, ry })
                }
            })
            onResize()
        }, () => {
            let attributesMap = {}
            selectedElements.forEach(elm => {
                let attributes = getAttributes(elm, { cx: 'number', cy: 'number', rx: 'number', ry: 'number' })
                attributesMap[elm.id] = { attributes }
            })
            dispatch(updateSvgAttribute(attributesMap))
        }, 'nw-resize')
    }

    setBBox(bbox: Rect2D) {
        this.bbox = bbox
        this.nwpoint.setPosition({ x: bbox.x, y: bbox.y })

    }

    hide() {
        this.nwpoint.hide()
    }

    show() {
        this.nwpoint.show()
    }

    componentWillUnmount() {
        this.nwpoint.componentWillUnmount()
    }
}