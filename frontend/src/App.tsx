import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
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
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
        </RidersProvider>
      </EmployeesProvider>
    </AuthManager>
  </Router>
);

export default App;
