import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { showGlobalError } from './context/errorModal';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Failed to find the root element');
  showGlobalError('Failed to initialize the app. Please refresh the page.', 'Initialization Error');
}

serviceWorker.register();
