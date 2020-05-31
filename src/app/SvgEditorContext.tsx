import * as React from 'react'
import { ComponentType } from 'react'
import { BehaviorSubject, Subject } from "rxjs";

declare global {
    type SvgEditorContextType = {
        editMode: SvgEditMode
        selectedElementIds: Array<string>
        selectedFrame: SelectedSvgAnimationFrame
        svgCreatedSignal: BehaviorSubject<SVGSVGElement>
        animationSignal: Subject<number>
        svgStates: SvgStateMap
        currentTime: number
        totalTime: number
        changeEditMode: (mode: SvgEditMode) => void
        onCreateSvgElement: (obj: SvgNode) => void
        onDeselectAll: () => void
        onUpdateSvgElement: (attributesMap: AttrUpdateMap) => void
        onSelectSvgElement: (id: string) => void
        onTimelineMoveTo: (number) => void
        onSelectAnimationFrame: (frame: SelectedSvgAnimationFrame) => void
    }

    type SelectedSvgAnimationFrame = {
        id: string
        start: number,
        end: number
    } & SvgAnimationFrame

    type SvgEditorContextComponentProps = {
        editorContext: SvgEditorContextType
    }
}

export const SvgEditorContext = React.createContext<SvgEditorContextType>(null)

type MapContextToProps<TContextProps> = (editorContext: SvgEditorContextType) => TContextProps

export function ConnectSvgEditorContext<TContextProps = {}>(mapContextToProps: MapContextToProps<TContextProps>) {
    return <C extends ComponentType<Matching<TContextProps, GetProps<C>>>>(WrapperComponent: C) => {
        return (props: HighOrderExposedComponentProps<TContextProps, C>) => {
            return <SvgEditorContext.Consumer>
                {value => <WrapperComponent {...mapContextToProps(value)} {...(props as any)} />}
            </SvgEditorContext.Consumer>
        }
    }
}

export function WithSvgEditorContext<C extends HighOrderWrappedComponentType<SvgEditorContextComponentProps, C>>(WrapperComponent: C) {
    return (props: HighOrderExposedComponentProps<SvgEditorContextComponentProps, C>) => {
        return <SvgEditorContext.Consumer>
            {value => <WrapperComponent editorContext={value} {...(props as any)} />}
        </SvgEditorContext.Consumer>
    }
}