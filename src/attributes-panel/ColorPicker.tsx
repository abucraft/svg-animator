import React, { CSSProperties } from 'react';
import { Popover } from 'antd';
import './ColorPicker.less'
import { SketchPicker, ColorChangeHandler } from 'react-color';

type ColorPickerProps = {
    value: string
    onChange: ColorChangeHandler
    style?: CSSProperties
    onChangeComplete: ColorChangeHandler
}

export function ColorPicker(props: ColorPickerProps) {
    return <Popover trigger="click" overlayClassName="color-picker-overlay" content={<SketchPicker color={props.value} onChange={props.onChange} onChangeComplete={props.onChangeComplete} />}>
        <div className="color-picker" style={props.style}>
            <div style={{ backgroundColor: props.value }}></div>
        </div>
    </Popover>
}