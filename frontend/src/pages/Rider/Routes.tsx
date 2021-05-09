import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import DateContext from '../../context/date';
import RiderHome from './RiderHome';

const Dashboard = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <Router basename="/rider">
        <Sidebar type="rider">
          <Switch>
            <Route
              path="/schedule"
              component={RiderHome}
            />
            <Route
              path="/settings"
              component={() => null}
            />
            <Route path="*">
              <Redirect to="/schedule" />
            </Route>
          </Switch>
        </Sidebar>
      </Router>
    </DateContext.Provider>
  );
};

export default Dashboard;
