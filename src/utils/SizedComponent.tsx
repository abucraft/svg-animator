import { Component, RefObject } from 'react'
import * as React from 'react'
import { ResizeSensor } from 'css-element-queries'

declare global {
    interface SizedComponentState {
        height: number,
        width: number
    }
    type SizedComponentProps = {
        style?: React.CSSProperties,
        className?: string
    }
}

export function SizedComponent<P>(WrappedComponent: React.ComponentType<P>): React.ComponentType<SizedComponentProps & P> {
    return class SizedWrapperComponent extends Component<SizedComponentProps & P> {
        state: SizedComponentState
        wrapper: RefObject<HTMLDivElement>
        props: any
        resizeSensor: ResizeSensor
        constructor(props) {
            super(props);
            this.state = {
                width: 0,
                height: 0
            }
            this.wrapper = React.createRef();
        }
        
        componentDidMount() {
            this.resizeSensor = new ResizeSensor(this.wrapper.current, (size) => {
                this.setState({ width: size.width, height: size.height })
            })
        }

        componentWillUnmount() {
            this.resizeSensor.detach()
        }
        render() {
            return (
                <div ref={this.wrapper} {...this.props}>
                    <WrappedComponent width={this.state.width} height={this.state.height} {...this.props} />
                </div>
            )
        }
    }
}