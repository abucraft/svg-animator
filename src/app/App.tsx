import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'
import { IntlProvider } from 'react-intl';
import store from '../core/Store'
import AppBody from './AppBody'
import './App.less'
import './ReactSplitPane.less'
import { IntlControlContext } from './IntlControlContext';
import { messages } from './LocaleMessages';

export class App extends Component<{}, { locale: string }>{
    constructor(props) {
        super(props)
        this.state = {
            locale: navigator.language
        }
    }

    changeLocale = (locale: string) => {
        this.setState({ locale })
    }
    render() {
        return <IntlControlContext.Provider value={{ locale: this.state.locale, changeLocale: this.changeLocale }}>
            <IntlProvider key={this.state.locale} locale={this.state.locale} messages={messages[this.state.locale]}>
                <Provider store={store}>
                    <AppBody />
                </Provider>
            </IntlProvider>
        </IntlControlContext.Provider>
    }
}

export default App