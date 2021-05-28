
import { set } from "mongoose";
import React, { useContext, createContext, useState } from "react";
import axios from "./axios";

const authContext = createContext();
const useAuth = () => {
    return useContext(authContext);
}

const Authentication = {

    isLogged: false,
    userData: null,
    errRegister: "",
    errLogin: "",


    async register(inputUsername, inputPassword, inputName, inputLastName) {

        await axios.post("/api/register", {
            username: inputUsername,
            password: inputPassword,
            name: inputName,
            lastName: inputLastName
        }).then(res => {
            console.log(res.data);
            this.errRegister = res.data.message;
            this.isLogged = res.data.isAuth;
            this.userData = res.data.user;

        });

        return Promise.resolve({ user: this.userData, isAuth: this.isLogged, error: this.errRegister });

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
        });

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
    const [isLogged, setIsLogged] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");

    const signup = (inputUsername, inputPassword, inputName, inputLastName, cb) => {
        Authentication.register(inputUsername, inputPassword, inputName, inputLastName).then(res => {
            console.log(res);
            setRegisterError(res.error);
            setUser(res.user);
            setIsLogged(res.isAuth);
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
        setLoginError,
        setRegisterError,
        signup,
        signin,
        signout,
        isAuthenticated
    };
}



export { ProvideAuth, useAuth };
