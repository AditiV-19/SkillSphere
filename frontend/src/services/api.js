import axios from "axios"

const API = axios.create({
    baseURL: "http://localhost:4000/api/v1"
})

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;

export const registerUser = (userData) => {
    return API.post("/register", userData)
}

export const loginUser = (userData) => {
    return API.post("/login", userData)
}

export const verifyEmail = (token) => {
    return API.get(`/verify-email/${token}`)
}

