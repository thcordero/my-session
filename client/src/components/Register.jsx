import React, { useState } from "react";
import { Redirect } from "react-router";
import { useAuth } from "./Auth";
import axios from "axios";



const Register = () => {
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [inputName, setInputName] = useState("");
    const [inputLastName, setInputLastName] = useState("");

    const auth = useAuth();

    const handleNameChange = event => {
        const newValue = event.target.value;
        setInputName(newValue);
    }
    const handleLastNameChange = event => {
        const newValue = event.target.value;
        setInputLastName(newValue);
    }

    const handleUsernameChange = event => {
        const newValue = event.target.value;
        setInputUsername(newValue);
    }
    const handlePasswordChange = event => {
        const newValue = event.target.value;
        setInputPassword(newValue);
    }
    const handleKeypress = event => {
        if (event.key === "Enter") {
            auth.signup(inputUsername, inputPassword, inputName, inputLastName, () => {

                setInputPassword("");
                setInputUsername("");
                setInputName("");
                setInputLastName("");
    
            });
            console.log("Enter pressed");
        }
    }

    const handleSubmit = (event) => {

        auth.signup(inputUsername, inputPassword, inputName, inputLastName, () => {

            setInputPassword("");
            setInputUsername("");
            setInputName("");
            setInputLastName("");

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

        {auth.isLogged ? <Redirect to={{ pathname: "/secrets/" + auth.user._id }} /> :

            <form className="register-data" onSubmit={handleSubmit}>

                <input
                    onChange={handleNameChange}
                    type="text"
                    value={inputName}
                    name="name"
                    placeholder="name"
                    autoComplete="off"

                />

                <input
                    onChange={handleLastNameChange}
                    type="text"
                    value={inputLastName}
                    name="last name"
                    placeholder="last name"
                    autoComplete="off"

                />

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

                <input className="register-button btn btn-block" type="submit" value="Create Account" />

                <p> or </p>

                <a href="https://your-check-list.herokuapp.com/auth/facebook" className="btn btn-block btn-social btn-facebook">
                <i class="fab fa-facebook"></i> Login with Facebook </a>
                

            </form>
        }

        <p className="error-register-credentials" style={{ visibility: auth.registerError ? "visible" : "hidden" }}>{auth.registerError}</p>

        {/* <button onClick={handleFacebookLogin}> Login with Facebook </button> */}

    </div>;

}

export default Register;
