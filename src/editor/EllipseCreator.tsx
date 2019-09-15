import React, { Component } from "react";
import { CreatorProps, mapDispatchForCreator } from "./RectCreator";
import { Tooltip } from "antd";
import * as classNames from 'classnames'
import { connect } from "react-redux";
import { clientPoint2SvgPoint } from "./Utils";

export const EllipseCreatorName = "EllipseCreator";

class EllipseCreator extends Component<CreatorProps>{
    componentDidUpdate(prevProps: CreatorProps) {
        if (this.props.active !== prevProps.active) {
            if (this.props.active) {
                this.props.changeEditMode("creating")
                this.props.svgRoot.addEventListener("click", this.onSvgClick)
            } else {
                this.props.svgRoot.removeEventListener("click", this.onSvgClick)
            }
        }
    }

    componentWillUnmount() {
        this.props.svgRoot.removeEventListener("click", this.onSvgClick)
    }

    onSvgClick = (event: MouseEvent) => {
        let mousePoint = { x: event.clientX, y: event.clientY }
        let svgPoint = clientPoint2SvgPoint(mousePoint, this.props.svgRoot)
        this.props.onCreateSvgElement({
            nodeName: 'ellipse',
            attributes: {
                cx: 0,
                cy: 0,
                rx: 100,
                ry: 100
            },
            transform: {
                x: svgPoint.x,
                y: svgPoint.y,
                xOrigin: 0,
                yOrigin: 0
            },
        })
        this.props.onDeselect(true)
    }

    onClick = () => {
        this.props.onSelect(EllipseCreatorName)
    }

    render() {
        return <Tooltip title="Create Rect" placement="right">
            <div className={classNames("tool-button", { 'active': this.props.active })} onClick={this.onClick}>
                <svg width="32" height="32" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="50" rx="30" ry="30"></ellipse>
                </svg>
            </div>
        </Tooltip>
    }
}


export const ConnectedEllipseCreator = connect(null, mapDispatchForCreator)(EllipseCreator)