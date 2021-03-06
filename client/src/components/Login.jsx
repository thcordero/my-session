import React, { useState } from "react";
import { Redirect } from "react-router";
import { useAuth } from "./Auth";

const Login = () => {

    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [register, setRegister] = useState(false);

    const auth = useAuth();


    const handleUsernameChange = event => {
        const newValue = event.target.value;
        setInputUsername(newValue);
    }

    const handlePasswordChange = event => {
        const newValue = event.target.value;
        setInputPassword(newValue);
    }

    const handleRegister = () => {
        setRegister(true);
        auth.setLoginError("");
    }

    const handleSubmit = (event) => {

        auth.signin(inputUsername, inputPassword, () => {

            setInputPassword("");
            setInputUsername("");
        });


        event.preventDefault();

    }

    const handleKeypress = event => {
        if (event.key === "Enter") {
            auth.signin(inputUsername, inputPassword, () => {

                setInputPassword("");
                setInputUsername("");
            });
            console.log("Enter pressed");
        }
    }



    return <div>
        <div className="user-title">
            <h3>Your Check List</h3>
            <button onClick={handleRegister}> Create Account </button>
        </div>
        {
            register ? <Redirect to={{ pathname: "/" }} /> :

                <div className="login-box">

                    {auth.isLogged ? <Redirect to={{ pathname: "/secrets/" + auth.user._id }} /> :

                        <form className="login-credentials" onSubmit={handleSubmit}>
                            <input
                                onChange={handleUsernameChange}
                                type="email"
                                value={inputUsername}
                                name="email"
                                placeholder="email"
                                autoComplete="off"

                            />

                            <input
                                onChange={handlePasswordChange}
                                onKeyPress={handleKeypress}
                                type="password"
                                value={inputPassword}
                                name="password"
                                placeholder="password"
                                autoComplete="off"

                            />

                            <input className="login-button btn btn-block" type="submit" value="Login" />

                            <p> or </p>

                            <a href="https://your-check-list.herokuapp.com/auth/facebook" className="btn btn-block btn-social btn-facebook"> 
                            <i class="fab fa-facebook"></i> Login with Facebook </a>

                        </form>
                    }
                    <p className="error-login-credentials" style={{ visibility: auth.loginError ? "visible" : "hidden" }}>{auth.loginError}</p>
                </div>
        }
        <div className="footer">

            Crafted by El Busky

      </div>
    </div>;

}

export default Login;


