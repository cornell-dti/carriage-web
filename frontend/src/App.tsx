import React from "react";
import LandingPage from "./components/landing";
import Table from "./components/table";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Table} />
      </Switch>
    </Router>
  );
};

export default App;
