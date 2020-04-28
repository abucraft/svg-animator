import React, { Component } from 'react'
import { createSvgNode, changeEditMode } from '../core/Actions';
import { CreatorProps, mapDispatchForCreator } from './RectCreator';
import { Tooltip } from 'antd';
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenNib } from '@fortawesome/free-solid-svg-icons/faPenNib'
import { connect } from 'react-redux';
import { SVG_XMLNS, deepCopy, pointsToLinePath, setAttributes, DefaultTransform } from '../utils/Utils';
import { createCircle } from './tools/DragPoint';
import { clientPoint2SvgPoint } from './Utils';

export const PathCreatorName = "PathCreatorName"

export class PathCreator extends Component<CreatorProps> {
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

    onSvgClick = (event: MouseEvent) => {
        let mousePoint = { x: event.clientX, y: event.clientY }
        let svgPoint = clientPoint2SvgPoint(mousePoint, this.props.svgRoot)
        this.props.onCreateSvgElement({
            nodeName: 'path',
            attributes: {
                d: [{ x: 0, y: 0 }]
            },
            transform: {
                ...DefaultTransform, ...{
                    x: svgPoint.x,
                    y: svgPoint.y
                }
            },
        })

        // reset the mode for default value 
        this.props.onDeselect(false)

        this.props.changeEditMode("path-creating")
    }

    onClick = () => {
        this.props.onSelect(PathCreatorName)
    }

    render() {
        return <Tooltip title="Path Creator" placement="right">
            <div className={classNames("tool-button", { 'active': this.props.active })} onClick={this.onClick}>
                <FontAwesomeIcon size="lg" icon={faPenNib} />
            </div>
        </Tooltip>
    }
}

export const PathCreatorConnected = connect(null, mapDispatchForCreator)(PathCreator)