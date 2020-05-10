import * as React from "react";
import * as ReactDOM from "react-dom";
import App from './app/App';
import { enableMapSet } from 'immer';

enableMapSet()

ReactDOM.render(<App />, document.getElementById('root'));