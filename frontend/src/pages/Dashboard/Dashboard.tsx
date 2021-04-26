import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  useHistory,
} from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Employees from './Employees';
import Students from './Students';
import Home from './Home';
import Locations from './Locations';
import Analytics from './Analytics';
import Notifications from '../../components/Notification/Notifications';
import EmployeeDetail from '../../components/UserDetail/EmployeeDetail';
import RiderDetail from '../../components/UserDetail/RiderDetail';
import ExportPreview from '../../components/ExportPreview/ExportPreview';
import DateContext from '../../context/date';

const AdminRoutes = () => {
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (ref) {
        ref.current?.focus();
      }
    });
    return unlisten;
  }, [history]);

  return (
    <>
      <div tabIndex={-1} ref={ref}></div>
      <a className='skip-main' href='#main'>Skip to main content</a>
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
            path="/employees"
            render={({ match: { url } }) => (
              <>
                <Route path={`${url}/`} component={Employees} exact />
                <Route path={`${url}/employee`} component={EmployeeDetail} />
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
          <Route path="/analytics" component={Analytics} />
          <Route path="/notifications" component={Notifications} />
          <Route path="*">
            <Redirect to="/home" />
          </Route>
        </Switch>
      </Sidebar>
    </>
  );
};

const Dashboard = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <Router basename="/dashboard">
        <AdminRoutes />
      </Router>
    </DateContext.Provider>
  );
};

export default Dashboard;
