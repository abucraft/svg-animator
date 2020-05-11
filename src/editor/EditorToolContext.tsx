import React from 'react';

export type EditorToolContextType = {
    // To block SelectBox click to select/deselect svg when resizing ot rotating
    eventLocked: boolean
}

export type EditorToolContextComponentProps = {
    editorToolContext: EditorToolContextType
}

export const EditorToolContext = React.createContext<EditorToolContextType>({ eventLocked: false })

export function WithEditorToolContext<C extends HighOrderWrappedComponentType<EditorToolContextComponentProps, C>>(WrappedComponent: C) {
    return (props: HighOrderExposedComponentProps<EditorToolContextComponentProps, C>)=>{
        return <EditorToolContext.Consumer>
            {
                (value)=> <WrappedComponent editorToolContext={value} {...(props as any)} />
            }
        </EditorToolContext.Consumer>
    }
}
