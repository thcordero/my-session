import React, { useState, useCallback } from "react";
import {Redirect } from "react-router";
import { useAuth } from "../Auth";
import List from "./List"


const Secrets = () => {

  
 
    const auth = useAuth();
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    const handleLogout = () => {
        auth.signout(() => { console.log(auth.user) });

    }

    return (
        <div>
            <div className="user-title">
                <h3>Your Check List</h3>
                <button onClick={handleLogout}> Logout </button>
            </div>
            <div className="header-user">
                <p>Welcome {auth.user.username} </p>

            </div>
            {auth.isLogged ? <List /> : <Redirect to={{ pathname: "/" }} />}

        </div>
    );
}

export default Secrets;