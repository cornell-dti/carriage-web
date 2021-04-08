import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './pages/Landing/Landing';
import AdminDashboard from './pages/Admin/Dashboard';
import RiderDashboard from './pages/Rider/Dashboard';
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
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/rider" component={RiderDashboard} />
      </Switch>
      </RidersProvider>
      </EmployeesProvider>
    </AuthManager>
  </Router>
);

export default App;
