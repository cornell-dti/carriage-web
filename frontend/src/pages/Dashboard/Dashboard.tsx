import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import DriverTable from './DriversTable';
import RiderTable from './RidersTable';
import Home from './Home';
import Settings from './Settings';
import './dashboard.css';

const Dashboard = () => (
  <Router basename="/dashboard">
    <Sidebar>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/drivers" component={DriverTable} />
        <Route path="/riders" component={RiderTable} />
        <Route path="/settings" component={Settings} />
        <Route path="*">
          <Redirect to="/home" />
        </Route>
      </Switch>
    </Sidebar>
  </Router>
);

export default Dashboard;
