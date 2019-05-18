import * as React from 'react'
import { BehaviorSubject, Subject } from "rxjs";

declare global {
    type SvgEditorContextType = {
        svgCreatedSignal: BehaviorSubject<SVGSVGElement>
        animationSignal: Subject<number>
        eventLocked: boolean
    }
}

export const SvgEditorContext = React.createContext<SvgEditorContextType>(null)