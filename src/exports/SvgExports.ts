import { Timelines } from "../timeline/Timelines";
import { SVG_XMLNS, getTransformString, ColorToRGBA, pointsToLinePath } from "../utils/Utils";
import { AttributeTypes } from "../core/SVGDefaultValues";
import Color from "color";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";


export const NoopAnimationFactory: AnimationFactory = {
    createFrame: () => null,
    createTransformFrame: () => null
}

function calculateKeyTimes(keyFrames: number[]) {
    let start = keyFrames[0]
    let duration = keyFrames[keyFrames.length - 1] - keyFrames[0]
    let keyTimes = keyFrames.map(t => (t - start) / duration)
    return { start, duration, keyTimes }
}

function getAttributesAnimate(attr: string, keyFrames: number[], values: string[]) {
    let { start, duration, keyTimes } = calculateKeyTimes(keyFrames)
    return `<animate 
                attributeType="XML" 
                attributeName="${attr}" 
                from="${values[0]}" 
                to="${values[values.length - 1]}"
                begin="${start}s" 
                dur="${duration}s"
                values="${values.join(';')}"
                keyTimes="${keyTimes.join(';')}"
                fill="freeze"/>`
}

function getTransformAnimate(transformType: string, keyFrames: number[], values: string[]) {
    let { start, duration, keyTimes } = calculateKeyTimes(keyFrames)
    return `<animateTransform attributeName="transform"
                attributeType="XML"
                type="${transformType}"
                from="${values[0]}"
                to="${values[values.length - 1]}"
                begin="${start}s"
                dur="${duration}s"
                values="${values.join(';')}"
                keyTimes="${keyTimes.join(';')}"
                fill="freeze"
                additive="sum"/>`
}

function isContainingTransformAnimation(svgAnimation?: Map<string, Frame[]>) {
    return svgAnimation && Array.from(svgAnimation.keys()).find(k => {
        return k.includes("translate") || k.includes("rotate") || k.includes("scale")
    })
}

function attributeToString(attr: string, value) {
    switch (AttributeTypes[attr]) {
        case "color":
            return ColorToRGBA(Color(value))
        case "path":
            return pointsToLinePath(value)
        case "number":
            return value.toString()
        default:
            return value
    }
}

export function exportToSvgString(svgStates: SvgStateMap): string {
    let svgStr = ""

    let animations = Timelines.buildAnimationsFromState(svgStates, new Map(), 0, NoopAnimationFactory)
    svgStates.forEach((svgState, id) => {
        let keys = [...svgState.keys()]
        keys.sort((v1, v2) => v1 - v2)
        let initState = svgState.get(keys[0]);
        let svg = `<${initState.nodeName}`
        let anime = animations.get(id)
        Object.keys(initState.attributes).forEach(key => {
            svg += ` ${key}="${attributeToString(key, initState.attributes[key])}"`
        })
        svg += `${isContainingTransformAnimation(anime) ? "" : ` transform="${getTransformString(initState.transform)}"`}`
        svg += ">"

        if (anime) {
            anime.forEach((animeFrames, attr) => {
                let keyFrames = []
                let values = []
                let animeType = "attributes" as SvgAnimationFrameType
                animeFrames.forEach((frame, index) => {
                    let animeFrame = frame[2]
                    let fromTime = frame[0]
                    let toTime = frame[1]
                    let fromValue = animeFrame.value.from, toValue = animeFrame.value.to;
                    animeType = animeFrame.type
                    if (animeFrame.type === "attributes") {
                        fromValue = attributeToString(attr, fromValue)
                        toValue = attributeToString(attr, toValue)
                    } else if (animeFrame.type === "rotate") {
                        fromValue = `${fromValue.rotation} ${fromValue.xOrigin} ${fromValue.yOrigin}`
                        toValue = `${toValue.rotation} ${toValue.xOrigin} ${toValue.yOrigin}`
                    } else if (animeFrame.type === "translate") {
                        fromValue = `${fromValue.x} ${fromValue.y}`
                        toValue = `${toValue.x} ${toValue.y}`
                    } else if (animeFrame.type === "scale") {
                        fromValue = `${fromValue.scaleX} ${fromValue.scaleY}`
                        toValue = `${fromValue.scaleX} ${fromValue.scaleY}`
                    }
                    if (keyFrames[keyFrames.length - 1] !== fromTime) {
                        keyFrames.push(fromTime)
                        values.push(fromValue)
                    }
                    keyFrames.push(toTime)
                    values.push(toValue)
                })
                switch (animeType) {
                    case "translate":
                    case "rotate":
                    case "scale":
                        svg += getTransformAnimate(animeType, keyFrames, values)
                        break;
                    case "attributes":
                        svg += getAttributesAnimate(attr, keyFrames, values)
                        break;
                }
            })
        }
        svg += `</${initState.nodeName}>`
        svgStr += svg
    })

    return `<?xml version="1.0"?>
    <svg xmlns="${SVG_XMLNS}" 
         width="1000" height="800">
         ${svgStr}
    </svg>`
}

// http://danml.com/download.html#FullSource
export function download(data, strFileName, strMimeType?) {

    var self = window, // this script is only for browsers anyway...
        defaultMime = "text/plain", //"application/octet-stream", // this default mime also triggers iframe downloads
        mimeType = strMimeType || defaultMime,
        payload = data,
        url = !strFileName && !strMimeType && payload,
        anchor = document.createElement("a"),
        toString = function (a) { return String(a); },
        fileName = strFileName || "download",
        blob,
        reader;

    if (String(this) === "true") { //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
        payload = [payload, mimeType];
        mimeType = payload[0];
        payload = payload[1];
    }


    if (url && url.length < 2048) { // if no filename and no mime, assume a url was passed as the only argument
        fileName = url.split("/").pop().split("?")[0];
        anchor.href = url; // assign href prop to temp anchor
        if (anchor.href.indexOf(url) !== -1) { // if the browser determines that it's a potentially valid url path:
            var ajax = new XMLHttpRequest();
            ajax.open("GET", url, true);
            ajax.responseType = 'blob';
            ajax.onload = function (e) {
                download((e.target as any).response, fileName, defaultMime);
            };
            setTimeout(function () { ajax.send(); }, 0); // allows setting custom ajax headers using the return:
            return ajax;
        } // end if valid url?
    } // end if url?


    //go ahead and download dataURLs right away
    if (/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)) {

        if (payload.length > (1024 * 1024 * 1.999)) {
            payload = dataUrlToBlob(payload);
            mimeType = payload.type || defaultMime;
        } else {
            return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
                navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
                saver(payload); // everyone else can save dataURLs un-processed
        }

    }//end if dataURL passed?

    blob = payload instanceof Blob ?
        payload :
        new Blob([payload], { type: mimeType });


    function dataUrlToBlob(strUrl) {
        var parts = strUrl.split(/[:;,]/),
            type = parts[1],
            decoder = parts[2] == "base64" ? atob : decodeURIComponent,
            binData = decoder(parts.pop()),
            mx = binData.length,
            i = 0,
            uiArr = new Uint8Array(mx);

        for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

        return new Blob([uiArr], { type: type });
    }

    function saver(url, winMode?) {

        if ('download' in anchor) { //html5 A[download]
            anchor.href = url;
            anchor.setAttribute("download", fileName);
            anchor.className = "download-js-link";
            anchor.innerHTML = "downloading...";
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            setTimeout(function () {
                anchor.click();
                document.body.removeChild(anchor);
                if (winMode === true) { setTimeout(function () { self.URL.revokeObjectURL(anchor.href); }, 250); }
            }, 66);
            return true;
        }

        // handle non-a[download] safari as best we can:
        if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
            url = url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            if (!window.open(url)) { // popup blocked, offer direct download:
                if (confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")) { location.href = url; }
            }
            return true;
        }

        //do iframe dataURL download (old ch+FF):
        var f = document.createElement("iframe");
        document.body.appendChild(f);

        if (!winMode) { // force a mime that will download:
            url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
        }
        f.src = url;
        setTimeout(function () { document.body.removeChild(f); }, 333);

    }//end saver




    if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
        return navigator.msSaveBlob(blob, fileName);
    }

    if (self.URL) { // simple fast and modern way using Blob and URL:
        saver(self.URL.createObjectURL(blob), true);
    } else {
        // handle non-Blob()+non-URL browsers:
        if (typeof blob === "string" || blob.constructor === toString) {
            try {
                return saver("data:" + mimeType + ";base64," + self.btoa(blob));
            } catch (y) {
                return saver("data:" + mimeType + "," + encodeURIComponent(blob));
            }
        }

        // Blob but not URL support:
        reader = new FileReader();
        reader.onload = function (e) {
            saver(this.result);
        };
        reader.readAsDataURL(blob);
    }
    return true;
}; /* end download() */