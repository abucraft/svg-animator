import { Timelines } from '../Timelines'
import { Map, List } from 'immutable'
import { SortedMap } from '../../utils/SortedMap';

let testSvgState = Map<string, SortedMap<any>>([['element1', new SortedMap({
    "0": {
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
    },
    "1": {
        attributes: {
            cx: "220",
            cy: "367"
        }
    }
})]])
let expectedSvgAnimations = Map({
    'element1': Map({
        "cx": Map<FrameKey, SvgAnimationFrame>([[List([0, 1]), { value: { from: '100', to: '220' } }]]),
        "cy": Map<FrameKey, SvgAnimationFrame>([[List([0, 1]), { value: { from: '50', to: '367' } }]])
    })
})

var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
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
            if (svv.size != tvv.size) {
                equal = false
                return
            }
            svv.forEach((svvv, svvk) => {
                if (!equal) return
                var tvvv = tvv.get(svvk)
                if (tvvv == undefined) {
                    equal = false
                    return
                }
                equal = svvv.value.from === tvvv.value.from && svvv.value.to === tvvv.value.to
            })
        })
    })
    return equal
}
it("should success", () => {
    var animations = Timelines.buildAnimationsFromState(testSvgState, Map(), 1)
    expect(svgAnimationEquals(animations, expectedSvgAnimations)).toBe(true);
})