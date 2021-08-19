import axios from "axios";


const instance = axios.create(
    {
        baseURL: "http://localhost:5000",
        withCredentials: true,
    }
);

export default instance;

// "http://localhost:5000",
//https://your-check-list.herokuapp.com