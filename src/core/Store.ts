import { RefObject } from 'react'
import { Subject, BehaviorSubject } from 'rxjs'
import { createStore, combineReducers, applyMiddleware, Store } from 'redux'
import { EDIT_SVG_TEXT, MOVE_TIMELINE, ADD_ALERT, CLEAR_ALERT, addAlert, SELECT_SVG_ELEMENT, DESELECT_SVG_ELEMENT_ALL, UPDATE_SVG_ATTRIBUTE, CHANGE_EDIT_MODE, CREATE_SVG_NODE } from './Actions'
import { svgToJson, initialSvg, nodeToJson, copySvgFields, compareSvgFields, svgJsonToText } from './SVGJson'
import { onErrorResumeNext } from 'rxjs';
import { composeWithDevTools } from 'redux-devtools-extension'
import produce from 'immer';

declare global {
    type SvgEditMode = 'select' | 'path-editing' | 'path-creating' | 'creating'
    type SvgStateMap = Map<string, Map<number, SvgNode>>
    interface SvgState {
        editMode: SvgEditMode,
        svgStates: SvgStateMap,
        selectedElementIds: Array<string>,
        currentTime: number,
        totalTime: number,
        currentSvgText: string
    }
    interface AppState {
        alert: {
            alertType?: "error" | "success" | "info" | "warning"
            message?: string
        }
        svg: SvgState
    }
}

let elementIncreamentalId = 1;
function getElementId() {
    return `element${elementIncreamentalId}`
}

const initSvgJson = svgToJson(initialSvg)

initSvgJson.attributes.id = getElementId()

const initialState: SvgState = {
    editMode: 'select',
    svgStates: new Map([[getElementId(), new Map([[0, initSvgJson]])]]),
    selectedElementIds: [getElementId()],
    currentTime: 0,
    totalTime: 3,
    currentSvgText: initialSvg,
}

function combineActionReducers(actionReducerMap: Map<string, any>, initailState = {}) {
    return function (state = initailState, action) {
        if (actionReducerMap.get(action.type)) {
            return actionReducerMap.get(action.type)(state, action)
        } else {
            return state
        }
    }
}

function selectSvgElement(state: SvgState, action: SelectSvgElementAction): SvgState {
    return { ...state, selectedElementIds: [action.value], currentSvgText: svgJsonToText(nodeToJson(document.getElementById(action.value))) }
}

function deselectSvgElementAll(state: SvgState, action: Action): SvgState {
    return { ...state, selectedElementIds: [], currentSvgText: "" };
}

function updateSvgAttribute(state: SvgState, action: UpdateSvgAttributeAction): SvgState {
    return produce(state, draftState => {
        let attributesMap = action.value;
        let currentTime = draftState.currentTime;
        let svgStates = draftState.svgStates;
        Object.entries(attributesMap).forEach(([id, v]) => {
            let svgState = svgStates.get(id);
            let oldAttrAndTransform = svgState.get(currentTime)
            let nowState: SvgNode = oldAttrAndTransform || { attributes: {}, transform: {} };
            Object.assign(nowState.attributes, v.attributes)
            Object.assign(nowState.transform, v.transform)
            svgState.set(currentTime, nowState);
        });
    })
}

function editSvgText(state: SvgState = initialState, action: EditSvgAction) {
    return produce(state, draft=>{
        let prevState = svgToJson(draft.currentSvgText)
        let curState = svgToJson(action.value)
        let id = draft.selectedElementIds[0];
        let svgState = draft.svgStates.get(id);
        if (draft.currentTime == 0 || svgState.get(0) == null) {
            svgState.set(0, curState);
        } else {
            svgState.set(draft.currentTime, compareSvgFields(prevState, curState))
        }
    })
}


function alertReducer(state, action: AddAlertAction) {
    switch (action.type) {
        case ADD_ALERT:
            return { alertType: action.alertType, message: action.message }
        case CLEAR_ALERT:
            return {}
        default:
            return {}
    }
}

function moveTimeline(state: SvgState, action): SvgState {
    return produce(state, draft=>{
        let text = "";
        if (draft.selectedElementIds.length > 0) {
            text = svgJsonToText(nodeToJson(document.getElementById(draft.selectedElementIds[0])))
        }
        draft.currentTime = action.value
        draft.currentSvgText = text
    })
}

function svgEditMode(state: SvgState, action: ChangeEditModeAction): SvgState {
    return { ...state, editMode: action.value }
}

function handleCreateSvgNode(state: SvgState, action: CreateSvgNodeAction): SvgState {
    return produce(state, draft=>{
        elementIncreamentalId += 1
        action.value.attributes.id = getElementId()
        draft.svgStates.set(getElementId(), new Map([[0, action.value]]))
        let selectedIds = draft.selectedElementIds
        if (action.value.nodeName == "path") {
            selectedIds = [action.value.attributes.id]
        }
        draft.selectedElementIds = selectedIds
    })
}

const errorAlerter = store => next => action => {
    try {
        return next(action)
    } catch (err) {
        console.debug(err)
        return next(addAlert('error', err.message))
    }
}

const store: Store = createStore(combineReducers({
    alert: alertReducer, svg: combineActionReducers(new Map([
        [EDIT_SVG_TEXT, editSvgText],
        [MOVE_TIMELINE, moveTimeline],
        [SELECT_SVG_ELEMENT, selectSvgElement],
        [DESELECT_SVG_ELEMENT_ALL, deselectSvgElementAll],
        [UPDATE_SVG_ATTRIBUTE, updateSvgAttribute],
        [CHANGE_EDIT_MODE, svgEditMode],
        [CREATE_SVG_NODE, handleCreateSvgNode]
    ]), initialState)
}), composeWithDevTools(applyMiddleware(errorAlerter)));

export default store

export const dispatch = store.dispatch