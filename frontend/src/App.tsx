import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './components/landing';
import DriverTable from './components/driver-table';
import RiderTable from './components/rider-table';
import { SignInButton } from './components/signin';

import './App.css';

const App = () => (
  <Router>
    <SignInButton />
    <Switch>
      <Route exact path="/" component={LandingPage} />
      <Route path="/driver-table" component={DriverTable} />
      <Route path="/rider-table" component={RiderTable} />
    </Switch>
  </Router>
);

export default App;
