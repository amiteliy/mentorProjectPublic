import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './Lobby';
import CodeBlock from './CodeBlock';


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