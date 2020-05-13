import React, { Component } from 'react';
import { Input, InputNumber } from 'antd';

import './AttributesItemRenderer.less';

type AttributesItemRendererProps = {
    layout: string[][]
    attributeTypes: { [key: string]: AttrValueType }
    dataSource: { [key: string]: any }
}

export class AttributesItemRenderer extends Component<AttributesItemRendererProps>{
    constructor(props) {
        super(props)
    }

    render() {
        return <div>
            {this.props.layout.map(row => {
                return <div className="attribute-row">
                    {row.map(key => {
                        let content = null
                        let attrType = this.props.attributeTypes[key] as AttrValueType
                        switch (attrType) {
                            case "number":
                                content = <InputNumber style={{ width: 100 }} value={this.props.dataSource[key]}></InputNumber>
                                break;
                            case "string":
                                content = <Input style={{ width: 100 }} value={this.props.dataSource[key]}></Input>
                                break;
                        }
                        return <div className="attribute-item">
                            <span style={{ display:"inline-block", minWidth: 80, textAlign: "right" }}>{key}:</span>{content}
                        </div>
                    })}
                </div>
            })}
        </div>
    }
}