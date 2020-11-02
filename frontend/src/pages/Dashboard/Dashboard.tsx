import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Drivers from './Drivers';
import Riders from './Riders';
import Home from './Home';
import Locations from './Locations';
import Settings from './Settings';
import DriverDetail from '../../components/DriverDetail/DriverDetail';

const Dashboard = () => (
  <Router basename="/dashboard">
    <Sidebar>
      <Switch>
        <Route path="/home" component={Home} />
        <Route
          path="/drivers"
          render={({ match: { url } }) => (
            <>
              <Route path={`${url}/`} component={Drivers} exact />
              <Route path={`${url}/driver`} component={DriverDetail} />
            </>
          )}
        />
        <Route path="/riders" component={Riders} />
        <Route path="/locations" component={Locations} />
        <Route path="/settings" component={Settings} />
        <Route path="*">
          <Redirect to="/home" />
        </Route>
      </Switch>
    </Sidebar>
  </Router>
);

export default Dashboard;
