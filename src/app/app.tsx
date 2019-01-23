import * as React from 'react'
import { hot } from 'react-hot-loader'
import { Provider, connect } from 'react-redux'
import store from '../core/store'
import AppBody from './app-body'
import './app.scss'
import './react-split-pane.scss'
import 'antd/dist/antd.css'

const App = () => (
    <Provider store={store}>
        <AppBody />
    </Provider>)

export default hot(module)(App)