import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './pages/Landing/Landing';
import AdminRoutes from './pages/Admin/Routes';
import RiderRoutes from './pages/Rider/Routes';
import { AuthManager } from './components/AuthManager/AuthManager';
import { EmployeesProvider } from './context/EmployeesContext';
import { RidersProvider } from './context/RidersContext';

import './styles/App.css';

const App = () => (
  <Router>
    <AuthManager>
      <EmployeesProvider>
        <RidersProvider>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route path="/admin" component={AdminRoutes} />
            <Route path="/rider" component={RiderRoutes} />
          </Switch>
        </RidersProvider>
      </EmployeesProvider>
    </AuthManager>
  </Router>
);

export default App;
