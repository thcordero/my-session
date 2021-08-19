import React, { useEffect, useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useAuth } from ".././Auth";
import axios from ".././axios";


const SetPassword = () => {

    const [inputPassword, setInputPassword] = useState("");
    const { id } = useParams();

    const auth = useAuth();


    useEffect(() => {
        axios.get("/api/register/tempuser/"+id)
            .then(res => {
                console.log(res.data);
                auth.setUser(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, [])


    const handlePasswordChange = event => {
        const newValue = event.target.value;
        setInputPassword(newValue);
    }

    const handleSubmit = (event) => {


        axios.delete("/api/register/tempuser/"+id).then(res => {

            console.log(res.data);

        });

        auth.getAuthenticated(inputPassword, auth.user, () => {
            setInputPassword("");
        });
        event.preventDefault();
    }

    const handleKeypress = event => {
        if (event.key === "Enter") {
            auth.getAuthenticated(inputPassword, id, () => {
                setInputPassword("");
            });
            console.log("Enter pressed");
        }
    }

    return auth.isLogged ? <Redirect to={{ pathname: "/secrets/" + auth.user._id }} /> : 
    
    (!auth.user ? <p>User not registed!</p> : <div>

        <div className="user-title">
            <h3>Your Check List</h3>

        </div>

        <p>Final step: set your password (minimum 8 characters).</p>

        <div className="register-box">




            <form className="register-data" onSubmit={handleSubmit}>

                <input
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeypress}
                    type="password"
                    value={inputPassword}
                    name="password"
                    placeholder="password"
                    autoComplete="off"

                />

                {/* <input
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeypress}
                    type="password"
                    value={inputPassword}
                    name="password"
                    placeholder="password confirmation"
                    autoComplete="off"

                /> */}

                <input className="register-button btn btn-block" type="submit" value="Login" />


            </form>

            {/* <p className="error-register-credentials" style={{ visibility: auth.registerError ? "visible" : "hidden" }}>{auth.registerError}</p> */}


        </div>

        <div className="footer">

            Crafted by El Busky

        </div>
    </div>);

}
export default SetPassword;