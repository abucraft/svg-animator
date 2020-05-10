import { Timelines } from '../Timelines'
import { SVG_XMLNS } from '../../utils/Utils';
import { NoopAnimationFactory } from '../../exports/SvgExports';

let testSvgState = new Map<string, Map<number, any>>([['element1', new Map([
    [0, {
        attributes: {
            cx: "100",
            cy: "50",
            fill: "red",
            id: "element1",
            r: "40",
            stroke: "black",
            "stroke-width": "2"
        },
        transform: {},
        children: [],
        nodeName: 'circle'
    }],
    [1, {
        attributes: {
            cx: "220",
            cy: "367"
        }
    }
    ]])]])
let expectedSvgAnimations: SvgAnimations = new Map([
    ['element1', new Map([
        ["cx", [[0, 1, { value: { from: '100', to: '220' } }]]],
        ["cy", [[0, 1, { value: { from: '50', to: '367' } }]]]
    ])]
])

var svg = document.createElementNS(SVG_XMLNS, "svg")
var circle = document.createElementNS(SVG_XMLNS, "circle")
document.body.append(svg)
svg.append(circle)
circle.id = "element1"

function svgAnimationEquals(source: SvgAnimations, target: SvgAnimations): boolean {
    var equal = true;
    if (source.size !== target.size) {
        return false;
    }
    source.forEach((value, key) => {
        if (!equal) return
        var tv = target.get(key)
        if (tv == undefined) {
            equal = false
            return
        }
        if (value.size != tv.size) {
            equal = false
            return
        }
        value.forEach((svv, svk) => {
            if (!equal) return
            var tvv = tv.get(svk)
            if (tvv == undefined) {
                equal = false
                return
            }
            if (svv.length != tvv.length) {
                equal = false
                return
            }
            svv.forEach((svvv, svvk) => {
                if (!equal) return
                var tvvv = tvv[svvk]
                if (tvvv == undefined) {
                    equal = false
                    return
                }
                equal = svvv[0]=== tvvv[0] && svvv[1] === tvvv[1] && svvv[2].value.from === tvvv[2].value.from && svvv[2].value.to === tvvv[2].value.to
            })
        })
    })
    return equal
}
it("should success", () => {
    var animations = Timelines.buildAnimationsFromState(testSvgState, new Map(), 1, NoopAnimationFactory)
    expect(svgAnimationEquals(animations, expectedSvgAnimations)).toBe(true);
})