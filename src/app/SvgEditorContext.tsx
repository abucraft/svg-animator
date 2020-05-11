import * as React from 'react'
import { BehaviorSubject, Subject } from "rxjs";

declare global {
    type SvgEditorContextType = {
        selectedElementIds: Array<string>
        svgCreatedSignal: BehaviorSubject<SVGSVGElement>
        animationSignal: Subject<number>
        svgStates: SvgStateMap
        currentTime: number
        totalTime: number
        // To block SelectBox click to select/deselect svg when resizing ot rotating
        eventLocked: boolean
        changeEditMode: (mode: SvgEditMode) => void
        onCreateSvgElement: (obj: SvgNode) => void
        onDeselectAll: () => void
        onUpdateSvgElement: (attributesMap: { [key: string]: any }) => void
        onSelectSvgElement: (id: string) => void
        onTimelineMoveTo: (number) => void
    }
    type SvgEditorContextComponentProps = {
        editorContext: SvgEditorContextType
    }
}

export const SvgEditorContext = React.createContext<SvgEditorContextType>(null)

export function WithSvgEditorContext<C extends React.ComponentType<Matching<SvgEditorContextComponentProps, GetProps<C>>>>(WrapperComponent: C) {
    return (props: Omit<GetProps<C>, keyof Shared<SvgEditorContextComponentProps, GetProps<C>>>) => {
        return <SvgEditorContext.Consumer>
            {value => <WrapperComponent editorContext={value} {...(props as any)} />}
        </SvgEditorContext.Consumer>
    }
}