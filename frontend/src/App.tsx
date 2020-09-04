import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './components/landing';
import Dashboard from './pages/Dashboard';
import { SignInButton } from './components/signin';

import './App.css';

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={() => <><SignInButton /><LandingPage /></>} />
      <Route path="/dashboard" component={Dashboard} />
    </Switch>
  </Router>
);

export default App;
