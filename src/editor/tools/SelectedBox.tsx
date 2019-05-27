import { Component, RefObject } from 'react'
import { Subscription } from 'rxjs';
import { updateSvgAttribute } from '../../core/Actions';
import { connect } from 'react-redux';
import { domPaser, getAttributes, setAttributes, setTransform } from '../../utils/Utils';
import { TransformControl } from './TransformControl';
import { SvgEditorContext } from '../../app/SvgEditorContext';

type SelectedBoxProps = {
    svgRoot: SVGSVGElement
} & SelectedBoxActionProps & SelectedBoxPropsFromStore

type SelectedBoxActionProps = {
    onMoveSvgElement: (attributesMap: { [key: string]: any }) => void
}

type SelectedBoxPropsFromStore = {
    selectedElementIds: Array<string>
}

type SelectedBoxState = {
    selectedElements: Array<SVGGraphicsElement>
}

function mapStateToProps(state: AppState): SelectedBoxPropsFromStore {
    return {
        selectedElementIds: state.svg.selectedElementIds
    }
}

function mapDispatchToProps(dispatch): SelectedBoxActionProps {
    return {
        onMoveSvgElement: (attributesMap: Map<string, SvgNode>) => {
            dispatch(updateSvgAttribute(attributesMap));
        }
    }
}

export class SelectedBox extends Component<SelectedBoxProps, SelectedBoxState> {
    box: SVGRectElement
    bbox: Rect2D
    rotation: number = 0
    position: Point2D
    animationSubscription: Subscription
    transformControl: TransformControl
    static contextType = SvgEditorContext
    context: SvgEditorContextType
    constructor(props) {
        super(props)
        this.state = {
            selectedElements: []
        }
    }

    static getDerivedStateFromProps(props: SelectedBoxProps) {
        return {
            selectedElements: props.selectedElementIds.map((id) => {
                return document.getElementById(id) as any as SVGGraphicsElement
            })
        }
    }

    updateTransformFromElements() {
        if (this.state.selectedElements.length === 1) {
            let gsTransform = this.state.selectedElements[0]._gsTransform
            this.rotation = (gsTransform && gsTransform.rotation) || 0
        }
    }

    componentDidUpdate() {
        if (this.props.selectedElementIds.length == 0) {
            this.hide()
        } else {
            this.show()
        }
    }

    getBBox = () => {
        return this.state.selectedElements.reduce((prev: SVGRect, elm) => {
            let box2 = elm.getBBox();
            let translateX = elm._gsTransform.x || 0
            let translateY = elm._gsTransform.y || 0
            if (prev) {
                let left = prev.x
                let top = prev.y
                let right = left + prev.width;
                let bottom = top + prev.height;
                let left2 = box2.x + translateX
                let top2 = box2.y + translateY
                let right2 = left2 + box2.width;
                let bottom2 = top2 + box2.height;
                prev.x = Math.min(prev.x, left2);
                prev.y = Math.min(prev.y, top2)
                prev.width = Math.max(right, right2) - prev.x;
                prev.height = Math.max(bottom, bottom2) - prev.y;
                return prev;
            } else {
                return {
                    x: box2.x + translateX,
                    y: box2.y + translateY,
                    width: box2.width,
                    height: box2.height
                }
            }
        }, null)
    }

    onMouseDown = (event: MouseEvent) => {
        event.stopPropagation()
        this.position = { x: event.clientX, y: event.clientY }
        this.bbox = this.box.getBBox()
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        event.stopPropagation()
        let dx = event.clientX - this.position.x
        let dy = event.clientY - this.position.y
        this.position = { x: event.clientX, y: event.clientY }
        this.state.selectedElements.forEach(elm => {
            setTransform(elm, { x: (elm._gsTransform.x || 0) + dx, y: (elm._gsTransform.y || 0) + dy })
        })
        this.updateAll()
    }

    onMouseUp = (event: MouseEvent) => {
        event.stopPropagation()
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        let attributesMap = {}
        this.state.selectedElements.forEach(elem => {
            attributesMap[elem.id] = { transform: elem._gsTransform }
        });
        this.props.onMoveSvgElement(attributesMap);
    }

    onClick = (event: Event) => {
        event.stopPropagation()
    }

    componentDidMount() {
        let bbox = this.getBBox()
        this.bbox = bbox
        this.box = domPaser.parseFromString(`<rect xmlns="http://www.w3.org/2000/svg" style="cursor:move;" x="0" y="0" width="${bbox.width}" height="${bbox.height}" stroke="black" stroke-width="0.5px" fill="transparent"/>`, "image/svg+xml").firstChild as any as SVGRectElement
        this.props.svgRoot.appendChild(this.box)
        this.box.addEventListener('mousedown', this.onMouseDown)
        this.box.addEventListener('click', this.onClick)
        this.animationSubscription = this.context.animationSignal.subscribe(this.updateAll)
        this.transformControl = new TransformControl(this.props.svgRoot, this.context, this.state.selectedElements, this.updateAll)
        this.updateAll()
    }

    updateBox = () => {
        this.box.setAttribute('width', this.bbox.width.toString());
        this.box.setAttribute('height', this.bbox.height.toString());
        setTransform(this.box, {
            x: this.bbox.x,
            y: this.bbox.y,
            rotation: this.rotation,
            xOrigin: this.bbox.width / 2,
            yOrigin: this.bbox.height / 2
        })
    }

    updateAll = () => {
        if (this.state.selectedElements.length > 0) {
            this.bbox = this.getBBox()
            this.updateTransformFromElements()
            this.updateBox()
            this.transformControl.setTransform(this.bbox, this.rotation)
        }
    }

    componentWillUnmount() {
        this.hide();
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        this.animationSubscription.unsubscribe()
        this.transformControl.componentWillUnmount()
    }

    hide() {
        if (this.props.svgRoot.contains(this.box))
            this.props.svgRoot.removeChild(this.box)
        this.transformControl.hide()
    }

    show() {
        this.props.svgRoot.append(this.box)
        this.transformControl.show()
        this.updateAll()
    }

    render() {
        return (null);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectedBox)