import { Component } from 'react'
import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMousePointer } from '@fortawesome/free-solid-svg-icons/faMousePointer'
import { Tooltip } from 'antd'
import * as classNames from 'classnames'
import { selectSvgElement, deselectSvgElementAll, changeEditMode } from '../core/Actions';
import { SvgEditorContext } from '../app/SvgEditorContext';

declare global {
    interface ToolBaseProps {
        svgRoot: SVGSVGElement
        active: boolean,
        onSelect: (name: string) => void
    }

    interface SelectorDispatcherProps {
        onDeselectAll: () => void
        changeToSelectMode: () => void
    }
    type SelectorProps = ToolBaseProps & SelectorDispatcherProps
}

function mapDispatchToProps(dispatch): SelectorDispatcherProps {
    return {
        changeToSelectMode: () => {
            dispatch(changeEditMode("select"))
        },
        onDeselectAll: () => {
            dispatch(deselectSvgElementAll())
        }
    }
}

export const SelectorName = "Selector"

class Selector extends Component<SelectorProps> {
    constructor(props) {
        super(props)
    }

    componentDidUpdate(prevProps: SelectorProps) {
        if (this.props.active !== prevProps.active) {
            if (!this.props.active) {
                this.props.onDeselectAll()
            } else {
                this.props.changeToSelectMode()
            }
        }
    }

    onClick = () => {
        this.props.onSelect(SelectorName)
    }

    render() {
        return (
            <Tooltip title="Select Element" placement="right">
                <div className={classNames("tool-button", { 'active': this.props.active })} onClick={this.onClick}>
                    <FontAwesomeIcon size="lg" icon={faMousePointer} />
                </div>
            </Tooltip>)
    }
}

export const ConnectedSelector = connect(null, mapDispatchToProps)(Selector)