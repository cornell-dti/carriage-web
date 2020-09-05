import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './components/landing';
import Dashboard from './pages/Dashboard';
import { AuthManager } from './components/AuthManager';

import './App.css';

const App = () => (
  <Router>
    <AuthManager>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </AuthManager>
  </Router>
);

export default App;
