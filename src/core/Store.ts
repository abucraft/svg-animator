import { RefObject } from 'react'
import { Subject, BehaviorSubject } from 'rxjs'
import { createStore, combineReducers, applyMiddleware, Store } from 'redux'
import { EDIT_SVG_TEXT, MOVE_TIMELINE, ADD_ALERT, CLEAR_ALERT, addAlert, SELECT_SVG_ELEMENT, DESELECT_SVG_ELEMENT_ALL, UPDATE_SVG_ATTRIBUTE, CHANGE_EDIT_MODE, CREATE_SVG_NODE } from './Actions'
import { svgToJson, initialSvg, nodeToJson, copySvgFields, compareSvgFields, svgJsonToText } from './SVGJson'
import { Map } from 'immutable'
import { onErrorResumeNext } from 'rxjs';
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
    svgStates: Map([[getElementId(), Map([[0, initSvgJson]])]]),
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
    let attributesMap = action.value;
    let currentTime = state.currentTime;
    let svgStates = state.svgStates;
    Map(attributesMap).forEach((v, id) => {
        let svgState = svgStates.get(id);
        let oldAttrAndTransform = svgState.get(currentTime)
        let nowState: SvgNode = (oldAttrAndTransform && { ...oldAttrAndTransform }) || { attributes: {}, transform: {} };
        nowState.attributes = { ...nowState.attributes, ...v.attributes };
        nowState.transform = { ...nowState.transform, ...v.transform }
        let newTimeStates = svgState.set(currentTime, nowState);
        svgStates = svgStates.set(id, newTimeStates);
    });
    return { ...state, svgStates: svgStates, currentSvgText: svgJsonToText(nodeToJson(document.getElementById(state.selectedElementIds[0]))) }
}

function editSvgText(state: SvgState = initialState, action: EditSvgAction) {
    let svgStates = state.svgStates
    let prevState = svgToJson(state.currentSvgText)
    let curState = svgToJson(action.value)
    let newTimeStates;
    let id = state.selectedElementIds[0];
    let svgState = state.svgStates.get(id);
    if (state.currentTime == 0 || svgState.get(0) == null) {
        newTimeStates = svgStates.set(id, svgState.set(0, curState));
    } else {
        newTimeStates = svgStates.set(id, svgState.set(state.currentTime, compareSvgFields(prevState, curState)))
    }
    return { ...state, svgStates: newTimeStates, currentSvgText: action.value }
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
    let text = "";
    if (state.selectedElementIds.length > 0) {
        text = svgJsonToText(nodeToJson(document.getElementById(state.selectedElementIds[0])))
    }
    return { ...state, currentTime: action.value, currentSvgText: text }
}

function svgEditMode(state: SvgState, action: ChangeEditModeAction): SvgState {
    return { ...state, editMode: action.value }
}

function handleCreateSvgNode(state: SvgState, action: CreateSvgNodeAction): SvgState {
    elementIncreamentalId += 1
    action.value.attributes.id = getElementId()
    let newMap = state.svgStates.set(getElementId(), Map([[0, action.value]]))
    let selectedIds = state.selectedElementIds
    if (action.value.nodeName == "path") {
        selectedIds = [action.value.attributes.id]
    }
    return { ...state, svgStates: newMap, selectedElementIds: selectedIds }
}

const errorAlerter = store => next => action => {
    try {
        return next(action)
    } catch (err) {
        console.debug(err)
        return next(addAlert('error', err.message))
    }
}

import { composeWithDevTools } from 'redux-devtools-extension'

const store: Store = createStore(combineReducers({
    alert: alertReducer, svg: combineActionReducers(Map([
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