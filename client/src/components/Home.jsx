import React, { useEffect, useState } from "react";
import { useHistory, Redirect } from "react-router";
import axios from "./axios";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import { useAuth } from "./Auth";


const Home = () => {

  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState(false);
  const auth = useAuth();

  useEffect(() => {

    auth.isAuthenticated(() =>{

      setLoading(false);

    });
  
  }, []);


  const handleLogin = () => {
    setLogin(true);
    auth.setRegisterError("");
  }

  return (

    <div>

      {loading ? <h3>loading...</h3> : (auth.isLogged ? <Redirect to={{ pathname: "/secrets/"+auth.user._id }} /> : <div>

        <div className="user-title">
          <h3>Your Check List</h3>
          <button onClick={handleLogin}> Login </button>
        </div>

        {login ? <Redirect to={{ pathname: "/login"}}/> : <Register />}

      </div>)
      }

      <div className="footer">

        Crafted by El Busky

      </div>

    </div>
  );
}

export default Home;


