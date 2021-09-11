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
import Employees from './Employees';
import Students from './Students';
import Home from './Home';
import Locations from './Locations';
import Analytics from './Analytics';
import EmployeeDetail from '../../components/UserDetail/EmployeeDetail';
import RiderDetail from '../../components/UserDetail/RiderDetail';
import ExportPreview from '../../components/ExportPreview/ExportPreview';
import DateContext from '../../context/date';
import { EmployeesProvider } from '../../context/EmployeesContext';
import { RidersProvider } from '../../context/RidersContext';

// Must be separate component, or else skip ref doesn't work.
const Routes = () => {
  const skipRef = useSkipMain();
  return (
    <>
      <div tabIndex={-1} ref={skipRef}></div>
      <HashLink className="skip-main" to="#main">
        Skip to main content
      </HashLink>
      <Sidebar type="admin">
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
          <Route path="/employees" component={Employees} />
          <Route path="/admins/:id" component={EmployeeDetail} />
          <Route path="/drivers/:id" component={EmployeeDetail} />
          <Route
            path="/riders"
            render={({ match: { url } }) => (
              <>
                <Route path={`${url}/`} component={Students} exact />
                <Route path={`${url}/:id`} component={RiderDetail} />
              </>
            )}
          />
          <Route path="/locations" component={Locations} />
          <Route path="/analytics" component={Analytics} />
          <Route path="*">
            <Redirect to="/home" />
          </Route>
        </Switch>
      </Sidebar>
    </>
  );
};

const AdminRoutes = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <EmployeesProvider>
        <RidersProvider>
          <Router basename="/admin">
            <Routes />
          </Router>
        </RidersProvider>
      </EmployeesProvider>
    </DateContext.Provider>
  );
};

export default AdminRoutes;
