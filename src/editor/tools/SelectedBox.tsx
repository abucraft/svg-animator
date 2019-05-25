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
        this.bbox = this.getBBox();
        if (this.state.selectedElements.length === 1) {
            let gsTransform = this.state.selectedElements[0]._gsTransform
            this.rotation = (gsTransform && gsTransform.rotation) || 0
        }
    }

    componentDidUpdate() {

    }

    getBBox = () => {
        return this.state.selectedElements.reduce((prev: SVGRect, elm) => {
            let box2 = elm.getBBox();
            if (prev) {
                let right = prev.x + prev.width;
                let bottom = prev.y + prev.height;
                let right2 = box2.x + box2.width;
                let bottom2 = box2.y + box2.height;
                prev.x = Math.min(prev.x, box2.x);
                prev.y = Math.min(prev.y, box2.y)
                prev.width = Math.max(right, right2) - prev.x;
                prev.height = Math.max(bottom, bottom2) - prev.y;
                return prev;
            } else {
                return box2;
            }
        }, null)
    }

    onMouseDown = (event: MouseEvent) => {
        event.stopPropagation()
        this.position = { x: event.clientX, y: event.clientY }
        this.bbox = getAttributes(this.box, { x: 'number', y: 'number', width: 'number', height: 'number' })
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        event.stopPropagation()
        let dx = event.clientX - this.position.x
        let dy = event.clientY - this.position.y
        this.position = { x: event.clientX, y: event.clientY }
        this.state.selectedElements.forEach((elm, idx) => {
            if (elm.tagName === 'ellipse') {
                let attrpox = getAttributes(elm, { cx: 'number', cy: 'number' })
                setAttributes(elm, { cx: attrpox.cx + dx, cy: attrpox.cy + dy })
            }
        })
        this.updateAll()
    }

    onMouseUp = (event: MouseEvent) => {
        event.stopPropagation()
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        let attributesMap = {}
        this.state.selectedElements.forEach(elem => {
            if (elem.tagName === 'ellipse') {
                let attributes = {
                    cx: elem.getAttribute('cx'),
                    cy: elem.getAttribute('cy')
                }
                attributesMap[elem.id] = { attributes }
            }
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
            translateX: this.bbox.x,
            translateY: this.bbox.y,
            rotation: this.rotation,
            xOrigin: this.bbox.width / 2,
            yOrigin: this.bbox.height / 2
        })
    }

    updateAll = () => {
        this.updateTransformFromElements()
        this.updateBox()
        this.transformControl.setTransform(this.bbox, this.rotation)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.selectedElementIds.length == 0) {
            this.hide()
        } else {
            this.show()
        }
        return false;
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
    }

    render() {
        return (null);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectedBox)