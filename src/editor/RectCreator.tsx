import React, { Component } from 'react'
import { Tooltip } from 'antd';
import * as classNames from 'classnames'
import { changeEditMode, createSvgNode } from '../core/Actions';
import { connect } from 'react-redux';
import { SvgEditorContext } from '../app/SvgEditorContext';
import { clientPoint2SvgPoint } from './Utils';

export type CreatorDispathProps = {
    onCreateSvgElement: (obj: SvgNode) => void
    changeEditMode: (mode: SvgEditMode) => void
}

export type CreatorProps = ToolBaseProps & CreatorDispathProps

export function mapDispatchForCreator(dispatch): CreatorDispathProps {
    return {
        onCreateSvgElement: (obj: SvgNode) => {
            dispatch(createSvgNode(obj))
        },
        changeEditMode: (mode: SvgEditMode) => {
            dispatch(changeEditMode(mode))
        }
    }
}

export const RectCreatorName = "RectCreator"

class RectCreator extends Component<CreatorProps> {
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
            nodeName: 'rect',
            attributes: {
                x: -50,
                y: -50,
                width: 100,
                height: 100
            },
            transform: {
                x: svgPoint.x,
                y: svgPoint.y,
                xOrigin: 0,
                yOrigin: 0
            },
        })

        // reset the mode for default value 
        this.props.onDeselect(true)
    }

    onClick = () => {
        this.props.onSelect(RectCreatorName)
    }

    render() {
        return <Tooltip title="Create Rect" placement="right">
            <div className={classNames("tool-button", { 'active': this.props.active })} onClick={this.onClick}>
                <svg width="32" height="32" viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="60" rx="10" ry="10"></rect>
                </svg>
            </div>
        </Tooltip>
    }
}

export const ConnectedRectCreator = connect(null, mapDispatchForCreator)(RectCreator)