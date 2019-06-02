import React, { Component } from 'react'
import { Tooltip } from 'antd';
import * as classNames from 'classnames'
import { changeEditMode, createSvgNode } from '../core/Actions';
import { connect } from 'react-redux';
import { SvgEditorContext } from '../app/SvgEditorContext';

type RectCreatorDispathProps = {
    onCreateSvgElement: (obj: SvgNode) => void
    changeToCreateMode: () => void
}

type RectCreatorProps = ToolBaseProps & RectCreatorDispathProps

function mapDispatch(dispatch): RectCreatorDispathProps {
    return {
        onCreateSvgElement: (obj: SvgNode) => {
            dispatch(createSvgNode(obj))
        },
        changeToCreateMode: () => {
            dispatch(changeEditMode("creating"))
        }
    }
}

export const RectCreatorName = "RectCreator"

export class RectCreator extends Component<RectCreatorProps> {
    componentDidUpdate(prevProps: RectCreatorProps) {
        if (this.props.active !== prevProps.active) {
            if (this.props.active) {
                this.props.changeToCreateMode()
                this.props.svgRoot.addEventListener("click", this.onSvgClick)
            } else {
                this.props.svgRoot.removeEventListener("click", this.onSvgClick)
            }
        }
    }

    componentWillUnmount() {
        this.props.svgRoot.removeEventListener("click", this.onSvgClick)
    }

    onSvgClick = () => {
        this.props.onCreateSvgElement({
            nodeName: 'rect',
            attributes: {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            },
            transform: {},
        })
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

export const ConnectedRectCreator = connect(null, mapDispatch)(RectCreator)