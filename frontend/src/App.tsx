import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthManager } from './components/AuthManager/AuthManager';
import {DriversProvider} from './context/DriversContext';
import './styles/App.css';

const App = () => (
  <Router>
    <AuthManager>
      <DriversProvider>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
      </DriversProvider>
    </AuthManager>
  </Router>
);

export default App;
