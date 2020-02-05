import React from "react";
import Page from "./components/page";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Page} />
      </Switch>
    </Router>
  );
};

export default App;
