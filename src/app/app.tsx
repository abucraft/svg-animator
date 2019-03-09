import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import { Provider, connect } from 'react-redux'
import store from '../core/store'
import AppBody from './app-body'
import './app.less'
import './react-split-pane.less'
import 'antd/dist/antd.css'

const App = () => (
    <Provider store={store}>
        <AppBody />
    </Provider>)

export default hot(App)