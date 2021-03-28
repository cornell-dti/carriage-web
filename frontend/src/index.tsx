import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import subscribeUser from './components/Notification/subscribeUser';

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register();

// subscribeUser();
