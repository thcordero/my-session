import React, { useContext, createContext, useState } from "react";
import axios from "./axios";
import SetPassword from "./User/SetPassword";

const authContext = createContext();
const useAuth = () => {
    return useContext(authContext);
}

const Authentication = {

    isLogged: false,
    userData: null,
    errRegister: "",
    errLogin: "",
    smtp_check: false,


    async register(inputUsername) {

        await axios.post("/api/register/tempuser", {username: inputUsername}).then(res => {
            console.log(res.data);
            if(res.data === "User already registed!"){
                this.errRegister = res.data;
            }
            else {
                this.errRegister = res.data.message;
            }
            this.smtp_check = res.data.smtp_check;
            this.userData = res.data.user;

        });

        return Promise.resolve({ user: this.userData, error: this.errRegister, validEmail: this.smtp_check});

    },

    async setPasword(inputPassword, hash, username) {

        await axios.post("/api/register", { _id: hash, password: inputPassword, username: username}).then(res => {
            console.log(res.data);
            this.isLogged = res.data.isAuth;
            this.userData = res.data.user;

        });

        return Promise.resolve({ user: this.userData, isAuth: this.isLogged});

    },

    async login(inputUsername, inputPassword) {

        await axios.post("/api/login", {
            username: inputUsername,
            password: inputPassword
        }).then(res => {
            console.log(res.data);
            this.errLogin = res.data.message;
            this.isLogged = res.data.isAuth;
            this.userData = res.data.user;
        }).catch(err => console.log(err));

        return Promise.resolve({ user: this.userData, isAuth: this.isLogged, error: this.errLogin });

    },

    async logout() {
        await axios.get("/api/logout").then(res => {
            console.log(res.data);
            this.isLogged = res.data.isAuth;
            this.userData = res.data.user;
        });

        return Promise.resolve({ user: this.userData, isAuth: this.isLogged });

    },

    async isAuth() {

        await axios.get("/api/secrets").then(res => {
            console.log(res.data);
            this.isLogged = res.data.isAuth;
            this.userData = res.data.user;

        });

        return Promise.resolve({ user: this.userData, isAuth: this.isLogged });
    }

}

const ProvideAuth = ({ children }) => {
    const auth = useProvideAuth();
    return (
        <authContext.Provider value={auth}>
            {children}
        </authContext.Provider>
    );
}

const useProvideAuth = () => {

    const [user, setUser] = useState(null);
    const [validEmail, setValidEmail] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");

    const signup = (inputUsername, cb) => {
        Authentication.register(inputUsername).then(res => {
            console.log(res);
            setRegisterError(res.error);
            setUser(res.user);
            setValidEmail(res.validEmail);
            cb();
        });
    }

    const getAuthenticated = (inputPassword, user, cb) => {
        Authentication.setPasword(inputPassword, user._id, user.username).then(res => {
            console.log(res);
            setRegisterError(res.error);
            setIsLogged(res.isAuth);
            setUser(res.user);
            cb();
        });
    }

    const signin = (inputUsername, inputPassword, cb) => {
        Authentication.login(inputUsername, inputPassword).then(res => {
            console.log(res);
            setLoginError(res.error);
            setUser(res.user);
            setIsLogged(res.isAuth);
            cb();
        });
    }


    const signout = (cb) => {
        Authentication.logout().then(res => {
            setUser(res);
            setIsLogged(res.isAuth);
            cb();
        });
    }

    const isAuthenticated = (cb) => {
        Authentication.isAuth().then(res => {
            setUser(res.user);
            setIsLogged(res.isAuth);
            cb();
        });
    }

    return {
        user,
        isLogged,
        loginError,
        registerError,
        validEmail,
        signup,
        signin,
        signout,
        isAuthenticated,
        getAuthenticated,
        setRegisterError,
        setLoginError,
        setUser,
    };
}



export { ProvideAuth, useAuth };
