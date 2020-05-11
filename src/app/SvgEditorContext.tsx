import * as React from 'react'
import { BehaviorSubject, Subject } from "rxjs";

declare global {
    type SvgEditorContextType = {
        editMode: SvgEditMode
        selectedElementIds: Array<string>
        svgCreatedSignal: BehaviorSubject<SVGSVGElement>
        animationSignal: Subject<number>
        svgStates: SvgStateMap
        currentTime: number
        totalTime: number
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

export function WithSvgEditorContext<C extends HighOrderWrappedComponentType<SvgEditorContextComponentProps, C>>(WrapperComponent: C) {
    return (props: HighOrderExposedComponentProps<SvgEditorContextComponentProps, C>) => {
        return <SvgEditorContext.Consumer>
            {value => <WrapperComponent editorContext={value} {...(props as any)} />}
        </SvgEditorContext.Consumer>
    }
}