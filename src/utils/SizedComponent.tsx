import { Component, RefObject } from 'react'
import * as React from 'react'
import { ResizeSensor } from 'css-element-queries'

declare global {
    interface SizedComponentState {
        height: number,
        width: number
    }
    type SizedComponentProps = {
        wrapperStyle?: React.CSSProperties,
        wrapperClassName?: string
    }
}

export function SizedComponent<C extends HighOrderWrappedComponentType<SizedComponentState, C>>(WrappedComponent: C): React.ComponentType<Omit<GetProps<C>, keyof Shared<SizedComponentState, GetProps<C>>> & SizedComponentProps> {
    return class SizedWrapperComponent extends Component<HighOrderExposedComponentProps<SizedComponentState, C> & SizedComponentProps> {
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
            let {wrapperStyle, wrapperClassName, ...restProps} = this.props
            return (
                <div ref={this.wrapper} style={wrapperStyle} className={wrapperClassName}>
                    <WrappedComponent width={this.state.width} height={this.state.height} {...restProps} />
                </div>
            )
        }
    }
}