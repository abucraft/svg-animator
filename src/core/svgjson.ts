let parser = new DOMParser();
const xmlParserStr = "application/xml"
export const initialSvg = `<circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red"/>`;
declare global {
    interface SvgNode {
        nodeName?: string
        attributes: { [key: string]: any }
        children?: [SvgNode]
    }
}
export function nodeToJson(node: Element): SvgNode {
    let svgjson = {}
    svgjson['nodeName'] = node.nodeName
    if (node.attributes) {
        svgjson["attributes"] = {}
        let attributes = node.attributes
        for (let i = 0; i < attributes.length; i++) {
            svgjson['attributes'][attributes[i].name] = attributes[i].value
        }
        svgjson['children'] = []
        let children = node.children
        for (let i = 0; i < children.length; i++) {
            svgjson['children'].push(nodeToJson(children[i]))
        }
    }
    return <any>svgjson
}

export function svgToJson(svg): SvgNode {
    let node: Element = <Element>parser.parseFromString(svg, xmlParserStr).firstChild
    if (node.getElementsByTagName('parsererror').length) {
        throw new Error(node.querySelector('parsererror > div').innerHTML)
    }
    return nodeToJson(node)
}

export function svgJsonToText(svgjson: SvgNode): string {
    return `<${svgjson.nodeName} ${Object.entries(svgjson.attributes).map(([key, value]) => key + '="' + value + '"').join(' ')}/>`
}

export function copySvgFields(source: SvgNode, dest: SvgNode): void {
    if (source.nodeName) {
        dest.nodeName = source.nodeName
    }
    if (source.attributes) {
        for (let [attr, value] of Object.entries(source.attributes)) {
            dest.attributes[attr] = value
        }
    }
    // TODO: Consider children order changed
    if (source.children) {
        for (let i = 0; i < source.children.length; i++) {
            if (dest.children[i]) {
                copySvgFields(source.children[i], dest.children[i])
            } else {
                dest.children.push(source.children[i])
            }
        }
    }
}

export function compareSvgFields(base: SvgNode, target: SvgNode): SvgNode {
    let diff = { attributes: {} }
    if (base.nodeName !== target.nodeName) {
        diff["nodeName"] = target.nodeName
    }
    if (base.attributes) {
        diff["attributes"] = {}
        // TODO: Consider attributes are added or removed in target
        for (let [attr, value] of Object.entries(base.attributes)) {
            if (target.attributes[attr] !== value) {
                diff["attributes"][attr] = target.attributes[attr]
            }
        }
    }
    if (base.children) {
        diff["children"] = []
        // TODO: Consider children has been added or removed in target
        for (let i = 0; i < base.children.length; i++) {
            diff["children"].push(compareSvgFields(base.children[i], target.children[i]))
        }
    }
    return diff
}