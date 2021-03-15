import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Drivers from './Drivers';
import Students from './Students';
import Home from './Home';
import Locations from './Locations';
import Settings from './Settings';
import DriverDetail from '../../components/UserDetail/DriverDetail';
import RiderDetail from '../../components/UserDetail/RiderDetail';
import ExportPreview from '../../components/ExportPreview/ExportPreview';
import DateContext from '../../context/date';

const Dashboard = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <Router basename="/dashboard">
        <Sidebar>
          <Switch>
            <Route
              path="/home"
              render={({ match: { url } }) => (
                <>
                  <Route path={`${url}/`} component={Home} exact />
                  <Route path={`${url}/export`} component={ExportPreview} />
                </>
              )}
            />
            <Route
              path="/drivers"
              render={({ match: { url } }) => (
                <>
                  <Route path={`${url}/`} component={Drivers} exact />
                  <Route path={`${url}/driver`} component={DriverDetail} />
                </>
              )}
            />
            <Route
              path="/riders"
              render={({ match: { url } }) => (
                <>
                  <Route path={`${url}/`} component={Students} exact />
                  <Route path={`${url}/rider`} component={RiderDetail} />
                </>
              )}
            />
            <Route path="/locations" component={Locations} />
            <Route path="/settings" component={Settings} />
            <Route path="*">
              <Redirect to="/home" />
            </Route>
          </Switch>
        </Sidebar>
      </Router>
    </DateContext.Provider>
  );
};

export default Dashboard;
