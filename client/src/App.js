import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './Lobby';
import CodeBlock from './CodeBlock';

import 'highlight.js/styles/nord.css';
console.log(process.env.REACT_APP_API_URL)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} exact />
        <Route path="/editor/:id" element={< CodeBlock />} />
      </Routes>
    </Router>
  );
}

export default App;