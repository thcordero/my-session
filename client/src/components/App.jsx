import React from "react";

import {
  Route,
  Switch,
  BrowserRouter as Router,
} from "react-router-dom";
import Home from "./Home";
import Secrets from "./User/Secrets";
import ProtectedRoute from "./ProtectedRoute";
import {ProvideAuth} from "./Auth";
import Login from "./Login"

const App = () => {

  return (
    <ProvideAuth>
      <Router>
        <Switch>

          <Route exact path="/" component={Home} />

          <Route exact path="/secrets" component={Home} />

          <Route path = "/login" component={Login} />

          <ProtectedRoute path="/secrets/:id" component={Secrets} />

        </Switch>
      </Router>
    </ProvideAuth>

  );
}

export default App;

