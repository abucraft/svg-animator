import { Map } from 'immutable'

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

    interface MoveSvgElementAction extends Action {
        // id --> attributes
        value: Map<string, SvgNode>
    }

    type SelectSvgElementAction = EditSvgAction
    type Pos = { x: number, y: number }
    type DeltaPos = { dx: number, dy: number }
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

export const MOVE_SVG_ELEMENT = "MOVE_SVG_ELEMENT"

export function moveSvgElement(attributesMap: Map<string, any>): MoveSvgElementAction {
    return {
        type: MOVE_SVG_ELEMENT,
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