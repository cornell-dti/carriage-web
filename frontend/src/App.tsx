import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthManager } from './components/AuthManager/AuthManager';
import {RidersProvider} from './context/RidersContext';

import './styles/App.css';

const App = () => (
  <Router>
    <AuthManager>
      <RidersProvider>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
      </RidersProvider>
    </AuthManager>
  </Router>
);

export default App;
