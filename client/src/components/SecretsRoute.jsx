
import React from "react";

import {
    Route,
    Redirect
} from "react-router-dom";

import { useAuth } from "./Auth.jsx";


const SecretsRoute = ({ component: Component, ...rest }) => {

    const auth = useAuth();
    console.log(auth);

    return <Route {...rest} >

        {auth.isLogged ? <Component {...rest} /> : <Redirect to={{ pathname: "/" }} />}

    </Route>


}

export default SecretsRoute;