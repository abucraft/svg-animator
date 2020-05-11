import React, { Component } from 'react'
import { Tooltip } from 'antd';
import * as classNames from 'classnames'
import { WithSvgEditorContext } from '../app/SvgEditorContext';
import { clientPoint2SvgPoint } from './Utils';
import { DefaultTransform } from '../utils/Utils';

export type CreatorProps = ToolBaseProps & SvgEditorContextComponentProps

export const RectCreatorName = "RectCreator"

class RectCreator extends Component<CreatorProps> {
    componentDidUpdate(prevProps: CreatorProps) {
        if (this.props.active !== prevProps.active) {
            if (this.props.active) {
                this.props.editorContext.changeEditMode("creating")
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
        this.props.editorContext.onCreateSvgElement({
            nodeName: 'rect',
            attributes: {
                x: -50,
                y: -50,
                width: 100,
                height: 100
            },
            transform: {
                ...DefaultTransform, ...{
                    x: svgPoint.x,
                    y: svgPoint.y
                }
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

export const ConnectedRectCreator = WithSvgEditorContext(RectCreator)