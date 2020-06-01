import { Component } from 'react'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMousePointer } from '@fortawesome/free-solid-svg-icons/faMousePointer'
import { Tooltip } from 'antd'
import * as classNames from 'classnames'
import {  WithSvgEditorContext } from '../app/SvgEditorContext';
import { FormattedMessage } from 'react-intl'

declare global {
    interface ToolBaseProps {
        svgRoot: SVGSVGElement
        active: boolean,
        onSelect: (name: string) => void
        onDeselect: (resetDefault: boolean) => void
    }

    type SelectorProps = ToolBaseProps & SvgEditorContextComponentProps
}

export const SelectorName = "Selector"

class Selector extends Component<SelectorProps> {
    constructor(props) {
        super(props)
    }

    componentDidUpdate(prevProps: SelectorProps) {
        if (this.props.active !== prevProps.active) {
            if (!this.props.active) {
                this.props.editorContext.onDeselectAll()
            } else {
                this.props.editorContext.changeEditMode("select")
            }
        }
    }

    onClick = () => {
        this.props.onSelect(SelectorName)
    }

    render() {
        return (
            <Tooltip title={<FormattedMessage id="toolbox.select" defaultMessage="Select"/>} placement="right">
                <div className={classNames("tool-button", { 'active': this.props.active })} onClick={this.onClick}>
                    <FontAwesomeIcon size="lg" icon={faMousePointer} />
                </div>
            </Tooltip>)
    }
}

export const ConnectedSelector = WithSvgEditorContext(Selector)