import React, { Component, CSSProperties, ReactNode, RefObject } from 'react';
import { ResizeSensor } from 'css-element-queries';

import "./CustomScrollContainer.less";

type CustomScrollContainerProps = {
    onScroll?: (top: number, left: number) => void
    children: ReactNode
    className?: string
    style?: CSSProperties
    scrollTop?: number
    scrollLeft?: number
    scrollX?: boolean
    scrollY?: boolean
}

type CustomScrollContainerState = {
    clientHeight: number
    clientWidth: number
    scrollHeight: number
    scrollWidth: number
    scrollTop: number
    scrollLeft: number
    active: boolean
}

export class CustomScrollContainer extends Component<CustomScrollContainerProps, CustomScrollContainerState> {
    scrollContainer: RefObject<HTMLDivElement>
    resizeSensor: ResizeSensor

    constructor(props) {
        super(props)
        this.scrollContainer = React.createRef()
        this.state = {
            clientHeight: 0,
            clientWidth: 0,
            scrollHeight: 0,
            scrollTop: 0,
            scrollWidth: 0,
            scrollLeft: 0,
            active: false
        }
    }

    componentDidMount() {
        this.resizeSensor = new ResizeSensor(this.scrollContainer.current, (size) => {
            let elm = this.scrollContainer.current
            this.setState({
                clientHeight: elm.clientHeight,
                clientWidth: elm.clientWidth,
                scrollHeight: elm.scrollHeight,
                scrollWidth: elm.scrollWidth,
                scrollTop: elm.scrollTop,
                scrollLeft: elm.scrollLeft
            })
        })
    }

    componentWillUnmount() {
        this.resizeSensor.detach()
    }

    componentDidUpdate(prevProps: CustomScrollContainerProps) {
        if (prevProps.scrollLeft !== this.props.scrollLeft) {
            this.onScrollLeft(this.props.scrollLeft)
        }
        if (prevProps.scrollTop !== this.props.scrollTop) {
            this.onScrollTop(this.props.scrollTop)
        }
    }

    onScrollTop = (offset: number) => {
        this.scrollContainer.current.scrollTop = offset
        this.setState({ scrollTop: offset })
    }

    onScrollLeft = (offset: number) => {
        this.scrollContainer.current.scrollLeft = offset
        this.setState({ scrollLeft: offset })
    }

    onScroll = (event: React.UIEvent<HTMLDivElement>) => {
        let target = this.scrollContainer.current
        this.setState({
            scrollTop: target.scrollTop,
            scrollLeft: target.scrollLeft,
            scrollHeight: target.scrollHeight,
            scrollWidth: target.scrollWidth,
            clientHeight: target.clientHeight,
            clientWidth: target.clientWidth,
        })
        this.props.onScroll && this.props.onScroll(target.scrollTop, target.scrollLeft)
    }

    onMouseEnter = () => {
        let target = this.scrollContainer.current
        this.setState({
            scrollHeight: target.scrollHeight,
            scrollWidth: target.scrollWidth,
            active: true
        })
    }

    scrollX = () => {
        return this.props.scrollX === undefined ? true : this.props.scrollX
    }

    scrollY = () => {
        return this.props.scrollY === undefined ? true : this.props.scrollY
    }

    render() {
        let showVerticalScroll = this.scrollY() && this.state.scrollHeight > this.state.clientHeight
        let showHorizontalScroll = this.scrollX() && this.state.scrollWidth > this.state.clientWidth
        return <div
            className={this.props.className}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={() => this.setState({ active: false })}
            style={{ position: "relative", overflow: 'hidden', ...this.props.style }}>
            <div ref={this.scrollContainer} style={{ position: "absolute", overflowX: this.scrollX() ? "scroll" : "hidden", overflowY: this.scrollY ? "scroll" : "hidden", left: 0, top: 0, right: this.scrollY() ? -ScrollBarSize : 0, bottom: this.scrollX() ? -ScrollBarSize : 0 }} onScroll={this.onScroll}>
                {this.props.children}
            </div>
            {showVerticalScroll && <CustomScrollBar
                orientation="vertical"
                active={this.state.active}
                clientSize={this.state.clientHeight}
                scrollBarSize={this.state.clientHeight}
                scrollSize={this.state.scrollHeight}
                scrollOffset={this.state.scrollTop}
                onScoll={this.onScrollTop}
            ></CustomScrollBar>
            }
            {showHorizontalScroll && <CustomScrollBar
                orientation="horizontal"
                active={this.state.active}
                clientSize={this.state.clientWidth}
                scrollBarSize={this.state.clientWidth - (showVerticalScroll ? ScrollBarSize : 0)}
                scrollSize={this.state.scrollWidth}
                scrollOffset={this.state.scrollLeft}
                onScoll={this.onScrollLeft}
            ></CustomScrollBar>}
        </div>
    }
}

type CustomScrollBarProps = {
    orientation: "horizontal" | "vertical"
    active: boolean
    clientSize: number,
    scrollSize: number,
    scrollOffset: number,
    scrollBarSize: number,
    onScoll: (offset: number) => void
}

export const ScrollBarSize = 17
class CustomScrollBar extends Component<CustomScrollBarProps>{
    startPoint: Point2D
    startOffset: number
    constructor(props) {
        super(props)
        this.startPoint = {
            x: 0,
            y: 0
        }
    }

    onMouseDown = (event: React.MouseEvent) => {
        this.startPoint = {
            x: event.clientX,
            y: event.clientY
        }
        this.startOffset = this.props.scrollOffset
        window.addEventListener("mousemove", this.onMouseMove)
        window.addEventListener("mouseup", this.onMouseUp)
    }

    onMouseMove = (event: MouseEvent) => {
        let offset = 0
        if (this.props.orientation === "vertical") {
            let dy = event.clientY - this.startPoint.y
            offset = this.props.scrollSize * dy / this.props.scrollBarSize
        } else {
            let dx = event.clientX - this.startPoint.x
            offset = this.props.scrollSize * dx / this.props.scrollBarSize
        }
        let totalOffset = this.startOffset + offset
        totalOffset = Math.max(0, Math.min(totalOffset, this.props.scrollSize - this.props.clientSize))
        this.props.onScoll(totalOffset)
    }

    onMouseUp = (event: MouseEvent) => {
        this.removeWindowEvents()
    }

    removeWindowEvents = () => {
        window.removeEventListener("mousemove", this.onMouseMove)
        window.removeEventListener("mouseup", this.onMouseUp)
    }

    componentWillUnmount() {
        this.removeWindowEvents()
    }

    render() {
        let barSize = this.props.scrollBarSize * this.props.clientSize / this.props.scrollSize
        let barOffset = this.props.scrollBarSize * this.props.scrollOffset / this.props.scrollSize
        return <div className={"svg-animator-scrollbar-outer " + this.props.orientation + (this.props.active ? " active" : " ")}
            style={this.props.orientation === "vertical" ? {
                height: this.props.scrollBarSize
            } : {
                    width: this.props.scrollBarSize
                }}>
            <div className="svg-animator-scrollbar-inner" onMouseDown={this.onMouseDown} style={
                this.props.orientation === "vertical" ? {
                    height: barSize,
                    top: barOffset
                } : {
                        width: barSize,
                        left: barOffset
                    }
            }></div>
        </div>
    }
}