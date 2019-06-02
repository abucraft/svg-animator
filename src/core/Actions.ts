declare global {
    interface Action {
        type: string
    }

    interface AddAlertAction extends Action {
        alertType: string
        message: string
    }

    interface EditSvgAction extends Action {
        value: string
    }

    interface AttributesAndTransform { attributes?: { [key: string]: any }, transform?: Transform }
    interface UpdateSvgAttributeAction extends Action {
        // id --> attributes
        value: { [key: string]: AttributesAndTransform }
    }

    interface TransformSvgElementsAction extends Action {
        value: { [key: string]: Transform }
    }

    type SelectSvgElementAction = EditSvgAction

    type ChangeEditModeAction = Action & {
        value: SvgEditMode
    }

    type CreateSvgNodeAction = Action & {
        value: SvgNode
    }
}

export const ADD_ALERT = "ADD_ALERT"

export function addAlert(alertType: string, message: string): AddAlertAction {
    return {
        type: ADD_ALERT,
        alertType,
        message
    }
}

export const CLEAR_ALERT = "CLEAR_ALERT"
export function clearAlert(): Action {
    return {
        type: CLEAR_ALERT
    }
}

export const SELECT_SVG_ELEMENT = "SELECT_SVG_ELEMENT"

export function selectSvgElement(id: string): SelectSvgElementAction {
    return {
        type: SELECT_SVG_ELEMENT,
        value: id
    }
}

export const DESELECT_SVG_ELEMENT_ALL = "DESELECT_SVG_ELEMENT_ALL"

export function deselectSvgElementAll(): Action {
    return {
        type: DESELECT_SVG_ELEMENT_ALL
    }
}

export const UPDATE_SVG_ATTRIBUTE = "UPDATE_SVG_ATTRIBUTE"

export function updateSvgAttribute(attributesMap: { [key: string]: any }): UpdateSvgAttributeAction {
    return {
        type: UPDATE_SVG_ATTRIBUTE,
        value: attributesMap
    }
}

export const EDIT_SVG_TEXT = 'EDIT_SVG_TEXT';

export function editSvgText(text: string): EditSvgAction {
    return {
        type: EDIT_SVG_TEXT,
        value: text
    }
}

export const EDIT_SVG_ELEMENTS = "EDIT_SVG_ELEMENTS";

export function editSvgElements(value: Array<any>) {
    return {
        type: EDIT_SVG_ELEMENTS,
        value: value
    }
}

export const TRANSFORM_SVG_ELEMENTS = "TRANSFORM_SVG_ELEMENTS";

export function transformSvgElements(transformMap: { [key: string]: Transform }): TransformSvgElementsAction {
    return {
        type: TRANSFORM_SVG_ELEMENTS,
        value: transformMap
    }
}

declare global {
    interface MoveTimelineAction extends Action {
        value: number
    }
}

export const MOVE_TIMELINE = 'MOVE_TIMELINE';

export function moveTimeline(time: number): MoveTimelineAction {
    return {
        type: MOVE_TIMELINE,
        value: time
    }
}

export const CHANGE_EDIT_MODE = "CHANGE_EDIT_MODE";

export function changeEditMode(mode: SvgEditMode): ChangeEditModeAction {
    return {
        type: CHANGE_EDIT_MODE,
        value: mode
    }
}

export const CREATE_SVG_NODE = "CREATE_SVG_NODE";

export function createSvgNode(node: SvgNode): CreateSvgNodeAction {
    return {
        type: CREATE_SVG_NODE,
        value: node
    }
}