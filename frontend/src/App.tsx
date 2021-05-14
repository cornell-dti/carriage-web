import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthManager } from './components/AuthManager/AuthManager';
import './styles/App.css';

const App = () => (
  <Router>
    <AuthManager />
  </Router>
);

export default App;
