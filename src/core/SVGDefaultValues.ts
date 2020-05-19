
export const AttributeTypes: { [key: string]: AttrValueType } = {
    cx: "number",
    cy: "number",
    rx: "number",
    ry: "number",
    width: "number",
    height: "number",
    "stroke-width": "number",
    "stroke": "color",
    "fill": "color",
    "d": "path"
}

const CommonAttributes = [
    "stroke-width",
    "stroke",
    "fill"
]

const EllipseAttributes = ["cx",
    "cy",
    "rx",
    "ry",
    ...CommonAttributes
]

const RectAttributes = [
    "width",
    "height",
    ...CommonAttributes
]

function createAttributeTypes(attrubtes: string[]) {
    return Object.fromEntries(attrubtes.map((k) => {
        return [k, AttributeTypes[k] || "number"]
    })) as  { [key: string]: AttrValueType }
}

export const CommonAttributeTypes = createAttributeTypes(CommonAttributes)

export const EllipseAttributeTypes = createAttributeTypes(EllipseAttributes)

export const RectAttributeTypes = createAttributeTypes(RectAttributes)

export const DefaultAttributes: { [key: string]: any } = Object.fromEntries(Object.keys(AttributeTypes).map(k => {
    return [k, getDefaultAttribute(k, AttributeTypes[k])]
}))

export function getDefaultAttribute(key?: string, type?: AttrValueType): any {
    switch (type) {
        case 'string':
            return ""
        case 'color':
            return "black";
        case "number":
            return 0
    }
}