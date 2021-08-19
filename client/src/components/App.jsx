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
import Validation from "./User/Validation"
import SetPassword from "./User/SetPassword"
import SecretsRoute from "./SecretsRoute";

const App = () => {

  return (
    <ProvideAuth>
      <Router>
        <Switch>

          <Route exact path="/" component={Home} />
          
           <Route exact path="/validation" component={Home} />

          <Route exact path="/secrets" component={Home} />

          <Route path = "/login" component={Login} />

          <SecretsRoute path="/secrets/:id" component={Secrets} />

          <ProtectedRoute path= "/validation/:id" component={Validation} />

          <Route path= "/setpassword/:id" component={SetPassword} />

        </Switch>
      </Router>
    </ProvideAuth>

  );
}

export default App;

