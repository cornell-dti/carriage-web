import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Drivers from './Drivers';
import Riders from './Riders';
import Home from './Home';
import Settings from './Settings';

const Dashboard = () => (
  <Router basename="/dashboard">
    <Sidebar>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/drivers" component={Drivers} />
        <Route path="/riders" component={Riders} />
        <Route path="/settings" component={Settings} />
        <Route path="*">
          <Redirect to="/home" />
        </Route>
      </Switch>
    </Sidebar>
  </Router>
);

export default Dashboard;
