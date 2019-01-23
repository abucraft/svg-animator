import { Component, RefObject } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMousePointer } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'antd'
import * as classNames from 'classnames'
import Editors from './editors'
import { selectSvgElement, deselectSvgElementAll } from '../core/actions';

declare global {
    interface ToolBaseProps {
        svgRoot: SVGSVGElement
        active: boolean,
        onSelect: (tool: any) => void
    }

    interface SelectorDispatcherProps {
        onSelectSvgElement: (id: string) => void
        onDeselectAll: () => void
    }
    type SelectorProps = ToolBaseProps & SelectorDispatcherProps
}

function mapDispatchToProps(dispatch) {
    return {
        onSelectSvgElement: (id: string) => {
            dispatch(selectSvgElement(id));
        },
        onDeselectAll: () => {
            dispatch(deselectSvgElementAll())
        }
    }
}

export class Selector extends Component<SelectorProps> {
    constructor(props) {
        super(props)
    }

    onClick = () => {
        this.props.onSelect(Selector)
    }

    onSvgClick = (event: Event) => {
        console.log(event.srcElement);
        let id = event.srcElement.id;
        if (id.length > 0) {
            this.props.onSelectSvgElement(id);
            event.stopPropagation();
        } else {
            console.log('deselect all');
            this.props.onDeselectAll();
        }
    }

    componentDidMount() {
        if (this.props.active) {
            this.props.svgRoot.addEventListener('click', this.onSvgClick);
        }
    }

    componentWillUnmount() {
        this.props.svgRoot.removeEventListener('click', this.onSvgClick)
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.active) {
            nextProps.svgRoot.addEventListener('click', this.onSvgClick);
        } else {
            nextProps.svgRoot.removeEventListener('click', this.onSvgClick);
        }
        return true;
    }

    render() {
        return (
            <Tooltip title="selection tool" placement="right">
                <div className={classNames("tool-button", { 'active': this.props.active })} onClick={this.onClick}>
                    <FontAwesomeIcon size="lg" icon={faMousePointer} />
                    <Editors svgRoot={this.props.svgRoot} />
                </div>
            </Tooltip>)
    }
}

export const ConnectedSelector = connect((state, ownProps: ToolBaseProps) => ownProps, mapDispatchToProps)(Selector)