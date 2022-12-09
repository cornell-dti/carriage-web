import { ToastProvider } from './context/toastContext';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleAuth } from './components/AuthManager/GoogleAuth';
import './styles/App.css';

const App = () => (
  <Router>
    <ToastProvider>
      <GoogleAuth />
    </ToastProvider>
  </Router>
);

export default App;
