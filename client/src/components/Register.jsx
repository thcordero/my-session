import React, { useState } from "react";
import { Redirect } from "react-router";
import { useAuth } from "./Auth";
import axios from "axios";



const Register = () => {
    const [inputUsername, setInputUsername] = useState("");


    const auth = useAuth();

    const handleUsernameChange = event => {
        const newValue = event.target.value;
        setInputUsername(newValue);
    }

    const handleKeypress = event => {
        if (event.key === "Enter") {
            auth.signup(inputUsername, () => {
                setInputUsername("");
            });
            console.log("Enter pressed");
        }
    }

    const handleSubmit = (event) => {

        auth.signup(inputUsername, () => {
            setInputUsername("");
        });
        event.preventDefault();
    }

    // const handleFacebookLogin = () => {

    //     console.log("and the facebook login?");

    //     axios.get("http://localhost:5000/auth/facebook/",{withCredentials: true})
    //         .then(res => console.log(res))
    //         .catch(err => console.log(err));

    // }


    return <div className="register-box">

        {auth.validEmail ? <Redirect to={{ pathname: "/validation/" + auth.user._id }} /> :

            <form className="register-data" onSubmit={handleSubmit}>

                <a href="https://your-check-list.herokuapp.com/auth/facebook" className="btn btn-block btn-social btn-facebook">
                <i class="fab fa-facebook"></i> Login with Facebook </a>

                <p> or </p>

                <input
                    onChange={handleUsernameChange}
                    type="email"
                    value={inputUsername}
                    name="email"
                    placeholder="email"
                    autoComplete="off"

                />

                <input className="register-button btn btn-block" type="submit" value="Create Account" />




            </form>
        }

        <p className="error-register-credentials" style={{ visibility: auth.registerError ? "visible" : "hidden" }}>{auth.registerError}</p>

        {/* <button onClick={handleFacebookLogin}> Login with Facebook </button> */}

    </div>;

}

export default Register;
