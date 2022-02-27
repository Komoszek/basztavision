import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter, Route, Routes } from 'react-router-dom'

import Home from "./App"
import Settings from "./pages/Settings.js"
import Recordings from "./pages/Recordings.js"

ReactDOM.render(
  <HashRouter>
    <Routes>
      <Route index element={<Home />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/recordings" element={<Recordings />} />
    </Routes>
  </HashRouter>,
  document.getElementById("root")
)
