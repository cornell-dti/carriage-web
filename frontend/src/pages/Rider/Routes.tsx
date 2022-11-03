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
import Settings from './Settings';
import DateContext from '../../context/date';
import { RidesProvider } from '../../context/RidesContext';

// Must be separate component, or else skip ref doesn't work.
const Routes = () => {
  // const skipRef = useSkipMain();
  return (
    <>
      {/* <div tabIndex={-1} ref={skipRef}></div> */}
      <HashLink className="skip-main" to="#main">
        Skip to main content
      </HashLink>
      <Sidebar type="rider">
        <Switch>
          <Route path="/schedule" component={Schedule} />
          <Route path="/settings" component={Settings} />
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
      <RidesProvider>
        <Router basename="/rider">
          <Routes />
        </Router>
      </RidesProvider>
    </DateContext.Provider>
  );
};

export default RiderRoutes;
