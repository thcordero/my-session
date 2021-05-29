import axios from "axios";


const instance = axios.create(
    {
        baseURL:"https://your-check-list.herokuapp.com",
        withCredentials: true,
    }
);

export default instance;

// "http://localhost:5000",