import { Component, RefObject } from 'react'
import * as React from 'react'

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
        constructor(props) {
            super(props);
            this.state = {
                width: 0,
                height: 0
            }
            this.wrapper = React.createRef();
        }

        onResize = () => {
            let rect = this.wrapper.current.getBoundingClientRect()
            this.setState({
                width: rect.width,
                height: rect.height
            })
        }
        componentDidMount() {
            this.onResize()
            window.addEventListener('resize', this.onResize)
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.onResize)
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