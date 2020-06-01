import * as React from 'react'
import { Component, RefObject } from 'react'
import { Button } from 'antd'
import "./PlayStopButton.less"

type PlayStopButtonProps = {
    onPlay: (play: boolean) => void,
    playing: boolean
}
export default class PlayStopButton extends React.PureComponent<PlayStopButtonProps> {
    fromPauseToPlay: RefObject<any>
    fromPlayToPause: RefObject<any>
    constructor(props) {
        super(props)
        this.fromPauseToPlay = React.createRef();
        this.fromPlayToPause = React.createRef();
    }

    componentDidMount() {
        this.fromPauseToPlay.current.beginElement()
    }

    componentDidUpdate(prevProps: PlayStopButtonProps) {
        if (this.props.playing !== prevProps.playing) {
            if (!this.props.playing) {
                this.fromPauseToPlay.current.beginElement()
            } else {
                this.fromPlayToPause.current.beginElement()
            }
        }
    }

    onClick = () => {
        this.props.onPlay(!this.props.playing)
    }
    render() {
        return (
            <Button type="primary" className="play-stop-button" onClick={this.onClick}>
                <svg viewBox="-2 -2 106 106" width="40">
                    <line id='line1' x1="38" y1="30" x2="38" y2="70" style={{ "strokeWidth": "10px", "stroke": "white", "strokeLinecap": "round" }} />
                    <path id='line2' d="M 66 30 L 66 50 L 66 70" rx="10" ry="10" style={{ "strokeWidth": "10px", "stroke": "white", "fill": "white", "strokeLinejoin": "round", "strokeLinecap": "round" }}>
                    </path>
                    <animate ref={this.fromPauseToPlay}
                        xlinkHref="#line2"
                        attributeName="d"
                        dur="150ms"
                        from="M 66 30 L 66 50 L 66 70"
                        to="M 38 30 L 70 50 L 38 70"
                        begin="indefinite"
                        fill="freeze"
                        id="from_pause_to_play"
                    />
                    <animate ref={this.fromPlayToPause}
                        xlinkHref="#line2"
                        attributeName="d"
                        dur="150ms"
                        from="M 38 30 L 70 50 L 38 70"
                        to="M 66 30 L 66 50 L 66 70"
                        fill="freeze"
                        id="from_play_to_pause"
                        begin="indefinite"
                    />
                </svg>
            </Button>)
    }
}