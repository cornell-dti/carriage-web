import { ToastProvider } from './context/toastContext';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthManager } from './components/AuthManager/AuthManager';
import './styles/App.css';

const App = () => (
  <Router>
    <ToastProvider>
      <AuthManager />
    </ToastProvider>
  </Router>
);

export default App;
