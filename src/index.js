import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter as Router, Route } from 'react-router-dom'

import Home from "./App"
import Settings from "./pages/Settings.js"
import Recordings from "./pages/Recordings.js"

ReactDOM.render(
    <Router>
                <Route exact path="/" component={Home} />
                <Route path="/settings" component={Settings} />
                <Route path="/recordings" component={Recordings} />

    </Router>,
    document.getElementById("root")

)
