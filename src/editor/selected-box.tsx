import { Component, RefObject } from 'react'
import * as React from 'react'
import { Map } from 'immutable'
import { stringify } from 'querystring';
import { AnimationSignal } from '../core/store'
import { Subscription } from 'rxjs';

declare global {
    interface SelectedBoxProps {
        svgRoot: SVGSVGElement
        selectedElementIds: Array<string>
        onMoveSvgElement: (attributesMap: Map<string, any>) => void
    }
    interface SelectedBoxState {
        selectedElements: Array<SVGGraphicsElement>
    }
}

export default class SelectedBox extends Component<SelectedBoxProps, SelectedBoxState> {
    parser = new DOMParser()
    box: SVGRectElement
    boxPosition: Pos
    position: Pos
    positions: Array<Pos>
    animationSubscription: Subscription
    constructor(props) {
        super(props)
        this.state = {
            selectedElements: this.props.selectedElementIds.map((id) => {
                return document.getElementById(id) as any as SVGGraphicsElement
            })
        }
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
        this.position = { x: event.clientX, y: event.clientY }
        this.positions = this.state.selectedElements.map((elm) => {
            return { x: parseFloat(elm.getAttribute('cx')), y: parseFloat(elm.getAttribute('cy')) }
        })
        this.boxPosition = { x: parseFloat(this.box.getAttribute('x')), y: parseFloat(this.box.getAttribute('y')) }
        event.stopPropagation()
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        let dx = event.clientX - this.position.x
        let dy = event.clientY - this.position.y
        this.state.selectedElements.forEach((elm, idx) => {
            if (elm.tagName === 'circle') {
                elm.setAttribute('cx', (this.positions[idx].x + dx).toString())
                elm.setAttribute('cy', (this.positions[idx].y + dy).toString())
            }
        })
        this.box.setAttribute('x', (this.boxPosition.x + dx).toString())
        this.box.setAttribute('y', (this.boxPosition.y + dy).toString())

    }

    onMouseUp = (event: MouseEvent) => {
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
        let attributesMap = Map<string, any>()
        this.state.selectedElements.forEach(elem => {
            if (elem.tagName === 'circle') {
                let attributes = {
                    cx: elem.getAttribute('cx'),
                    cy: elem.getAttribute('cy')
                }
                attributesMap = attributesMap.set(elem.id, { attributes })
            }
        });
        this.props.onMoveSvgElement(attributesMap);
    }

    onClick = (event: Event) => {
        event.stopPropagation()
    }

    componentDidMount() {
        let bbox = this.getBBox()
        this.box = this.parser.parseFromString(`<rect xmlns="http://www.w3.org/2000/svg" style="cursor:move;" x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" stroke="black" stroke-width="0.5px" fill="transparent"/>`, "image/svg+xml").firstChild as any as SVGRectElement
        this.props.svgRoot.appendChild(this.box)
        this.box.addEventListener('mousedown', this.onMouseDown)
        this.box.addEventListener('click', this.onClick)
        this.animationSubscription = AnimationSignal.subscribe((next) => {
            let nbbox = this.getBBox();
            this.box.setAttribute('x', nbbox.x.toString());
            this.box.setAttribute('y', nbbox.y.toString());
            this.box.setAttribute('width', nbbox.width.toString());
            this.box.setAttribute('height', nbbox.height.toString());
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.selectedElementIds.length == 0) {
            this.removeNode()
        } else {
            this.props.svgRoot.appendChild(this.box)
        }
        return false;
    }

    componentWillUnmount() {
        this.removeNode();
        window.removeEventListener('mouseup', this.onMouseUp)
        this.animationSubscription.unsubscribe()
    }

    removeNode() {
        if (this.props.svgRoot.contains(this.box))
            this.props.svgRoot.removeChild(this.box)
    }

    render() {
        return (null);
    }
}