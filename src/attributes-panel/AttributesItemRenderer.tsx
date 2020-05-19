import React, { Component, Fragment } from 'react';
import { Input, InputNumber } from 'antd';

import './AttributesItemRenderer.less';
import { ColorPicker } from './ColorPicker';
import { ColorResult } from 'react-color';

export type AttributeItemLayout = string | {
    label?: string,
    attribute?: string,
    children?: AttributeItemLayout[]
}

type AttributesItemRendererProps = {
    layout: AttributeItemLayout[]
    attributeTypes: { [key: string]: AttrValueType }
    dataSource: { [key: string]: any }
    onChange: (value: any, key: string) => void
    onChangeComplete: (value: any, key: string) => void
}

export class AttributesItemRenderer extends Component<AttributesItemRendererProps>{
    constructor(props) {
        super(props)
    }

    renderAttributeRow(row: AttributeItemLayout) {
        let attribute = null
        let label = null
        let children: AttributeItemLayout[] = null
        if (typeof row === "string") {
            attribute = row
            label = row

        } else {
            attribute = row.attribute
            label = row.label
            children = row.children
        }
        let content = null
        if (attribute) {
            let attrType = this.props.attributeTypes[attribute] as AttrValueType
            switch (attrType) {
                case "number":
                    content = <InputNumber
                        style={{ width: 100 }}
                        value={this.props.dataSource[attribute]}
                        onChange={(v) => {
                            this.props.onChangeComplete(v, attribute)
                        }}
                    ></InputNumber>
                    break;
                case "string":
                    content = <Input style={{ width: 100 }} value={this.props.dataSource[attribute]}></Input>
                    break;
                case "color":
                    content = <ColorPicker
                        value={this.props.dataSource[attribute]}
                        onChange={(value) => {
                            value && this.props.onChange(value.hex, attribute)
                        }}
                        style={{ width: 40, verticalAlign: "bottom" }}
                        onChangeComplete={(value) => {
                            value && this.props.onChangeComplete(value.hex, attribute)
                        }}
                    />
                    break;
            }
        }
        let childrenElms = <Fragment>
            {content}
            {children && children.map(crow => {
                return this.renderAttributeRow(crow)
            })}
        </Fragment>

        return attribute && label ? <div key={attribute} className="attribute-item">
            {label ? <span style={{ display: "inline-block", minWidth: 80, textAlign: "right" }}>{label}:</span> : null}
            {childrenElms}
        </div> : childrenElms
    }

    render() {
        return <div>
            {this.props.layout.map((row, idx) => {
                return <div key={idx} className="attribute-row">
                    {this.renderAttributeRow(row)}
                </div>
            })}
        </div>
    }
}