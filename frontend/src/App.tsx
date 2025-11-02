import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/toastContext';
import { ErrorModalProvider } from './context/errorModal';
import { GoogleAuth } from './components/AuthManager/GoogleAuth';
import './styles/App.css';
import { setAuthToken } from './util/axios';

const App = () => {
  useEffect(() => {
    const jwtCookie = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('jwt='));
    if (jwtCookie) {
      const token = jwtCookie.split('=')[1];
      setAuthToken(token);
    }
  }, []);

  return (
    <Router>
      <ErrorModalProvider>
        <ToastProvider>
          <GoogleAuth />
        </ToastProvider>
      </ErrorModalProvider>
    </Router>
  );
};

export default App;
