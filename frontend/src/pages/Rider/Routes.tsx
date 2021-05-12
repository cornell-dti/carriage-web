
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import useSkipMain from '../../hooks/useSkipMain';
import Sidebar from '../../components/Sidebar/Sidebar';
import Schedule from './Schedule';
import DateContext from '../../context/date';

const Routes = () => {
  const skipRef = useSkipMain();
  return (
    <>
      <div tabIndex={-1} ref={skipRef}></div>
      <HashLink className='skip-main' to='#main'>Skip to main content</HashLink>
      <Sidebar type="rider">
        <Switch>
          <Route
            path="/schedule"
            component={() => null}
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
    </>
  );
};

const RiderRoutes = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <Router basename="/rider">
        <Sidebar type="rider">
          <Switch>
            <Route
              path="/schedule"
              component={Schedule}
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

export default RiderRoutes;
