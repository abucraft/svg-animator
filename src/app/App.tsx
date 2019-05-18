import * as React from 'react'
import { Provider, connect } from 'react-redux'
import store from '../core/Store'
import AppBody from './AppBody'
import './App.less'
import './ReactSplitPane.less'

export const App = () => (
    <Provider store={store}>
        <AppBody />
    </Provider>)

export default App