import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import { Provider, connect } from 'react-redux'
import store from '../core/Store'
import AppBody from './AppBody'
import './App.less'
import './ReactSplitPane.less'
import 'antd/dist/antd.css'

const App = () => (
    <Provider store={store}>
        <AppBody />
    </Provider>)

export default hot(App)