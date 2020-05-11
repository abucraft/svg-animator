import { Component, RefObject } from 'react'
import { Subscription } from 'rxjs';
import { updateSvgAttribute, selectSvgElement, deselectSvgElementAll } from '../../core/Actions';
import { connect } from 'react-redux';
import { domPaser, getAttributes, setAttributes, setTransform, SVG_XMLNS, getTransform } from '../../utils/Utils';
import { TransformControl } from './TransformControl';
import { WithSvgEditorContext } from '../../app/SvgEditorContext';
import { EditorToolContextComponentProps, WithEditorToolContext } from '../EditorToolContext';

type SelectedBoxProps = {
    svgRoot: SVGSVGElement
} & SvgEditorContextComponentProps & EditorToolContextComponentProps

type SelectedBoxState = {
    selectedElements: Array<SVGGraphicsElement>
}

export class SelectedBox extends Component<SelectedBoxProps, SelectedBoxState> {
    svgRoot: SVGSVGElement
    box: SVGRectElement
    bbox: Rect2D
    rotation: number = 0
    // For debounce
    mouseUpAndMoveLocked = false
    position: Point2D
    animationSubscription: Subscription
    svgSubscription: Subscription
    transformControl: TransformControl
    constructor(props) {
        super(props)
        this.state = {
            selectedElements: []
        }
    }

    updateTransformFromElements() {
        if (this.state.selectedElements.length === 1) {
            let transform = getTransform(this.state.selectedElements[0])
            this.rotation = transform.rotation
        }
    }

    componentDidUpdate(prevProps: SelectedBoxProps) {
        // console.log(this.props, prevProps)
        if (this.props !== prevProps) {
            this.setState({
                selectedElements: this.props.editorContext.selectedElementIds.map((id) => {
                    return document.getElementById(id) as any as SVGGraphicsElement
                })
            }, () => {
                this.transformControl.setSelectedElements(this.state.selectedElements)
                this.updateAll()
            })
        }
        if (this.state.selectedElements.length == 0) {
            this.hide()
        } else {
            this.show()
        }
    }

    getBBox = () => {
        return this.state.selectedElements.reduce((prev: SVGRect, elm) => {
            let box2 = elm.getBBox();
            let transform = getTransform(elm)
            let translateX = transform.x
            let translateY = transform.y
            let scaleX = transform.scaleX
            let scaleY = transform.scaleY
            if (prev) {
                let left = prev.x
                let top = prev.y
                let right = left + prev.width;
                let bottom = top + prev.height;
                let left2 = box2.x * scaleX + translateX
                let top2 = box2.y * scaleY + translateY
                let right2 = left2 + box2.width * scaleX;
                let bottom2 = top2 + box2.height * scaleY;
                prev.x = Math.min(prev.x, left2);
                prev.y = Math.min(prev.y, top2)
                prev.width = Math.max(right, right2) - prev.x;
                prev.height = Math.max(bottom, bottom2) - prev.y;
                return prev;
            } else {
                return {
                    x: box2.x * scaleX + translateX,
                    y: box2.y * scaleY + translateY,
                    width: box2.width * scaleX,
                    height: box2.height * scaleY
                }
            }
        }, null)
    }

    onMouseDown = (event: MouseEvent) => {
        event.stopPropagation()
        this.props.editorToolContext.eventLocked = true
        this.position = { x: event.clientX, y: event.clientY }
        this.bbox = this.box.getBBox()
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        if (this.mouseUpAndMoveLocked)
            return
        event.stopPropagation()
        let dx = event.clientX - this.position.x
        let dy = event.clientY - this.position.y
        this.position = { x: event.clientX, y: event.clientY }
        this.state.selectedElements.forEach(elm => {
            let transform = getTransform(elm)
            setTransform(elm, { x: transform.x + dx, y: transform.y + dy })
        })
        this.updateAll()
    }

    onMouseUp = (event: MouseEvent) => {
        event.stopPropagation()
        this.props.editorToolContext.eventLocked = false
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        if (this.mouseUpAndMoveLocked)
            return
        let attributesMap = {}
        this.state.selectedElements.forEach(elem => {
            attributesMap[elem.id] = { transform: elem._gsTransform }
        });
        this.props.editorContext.onUpdateSvgElement(attributesMap);
    }

    onClick = (event: Event) => {
        event.stopPropagation()
    }

    onSvgMouseDown = (event: MouseEvent) => {
        if (event.target !== this.svgRoot) {
            let id = (event.srcElement as HTMLElement).id;
            if (id.length > 0) {
                event.stopPropagation()
                this.props.editorContext.onSelectSvgElement(id);
                let selectedElements = [event.target as SVGGraphicsElement]
                // For debounce. When click in a short time, we don't consider it as move
                this.mouseUpAndMoveLocked = true
                setTimeout(() => this.mouseUpAndMoveLocked = false, 200)
                this.setState({ selectedElements: selectedElements }, () => {
                    this.onMouseDown(event)
                })
            }
        }
    }

    onSvgMouseup = (event: MouseEvent) => {
        if (!this.props.editorToolContext.eventLocked && event.srcElement === this.svgRoot) {
            this.props.editorContext.onDeselectAll()
        }
    }

    componentDidMount() {
        this.box = domPaser.parseFromString(`<rect xmlns="${SVG_XMLNS}" style="cursor:move;" x="0" y="0" width="100" height="100" stroke="black" stroke-width="0.5px" fill="transparent"/>`, "image/svg+xml").firstChild as any as SVGRectElement
        this.props.svgRoot.appendChild(this.box)
        this.box.addEventListener('mousedown', this.onMouseDown)
        this.box.addEventListener('click', this.onClick)
        this.svgSubscription = this.props.editorContext.svgCreatedSignal.subscribe(svg => {
            this.svgRoot = svg
            this.svgRoot.addEventListener("mousedown", this.onSvgMouseDown)
            this.svgRoot.addEventListener("mouseup", this.onSvgMouseup)
        })
        this.animationSubscription = this.props.editorContext.animationSignal.subscribe(this.updateAll)
        this.transformControl = new TransformControl(this.props.svgRoot, this.props.editorContext, this.props.editorToolContext, this.updateAll)
        this.componentDidUpdate(null)
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
        this.svgRoot.removeEventListener("mousedown", this.onSvgMouseDown)
        this.svgRoot.removeEventListener("mouseup", this.onSvgMouseup)
        this.animationSubscription.unsubscribe()
        this.svgSubscription.unsubscribe()
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

export default WithSvgEditorContext(WithEditorToolContext(SelectedBox))