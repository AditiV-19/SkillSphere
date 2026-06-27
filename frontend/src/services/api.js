import axios from "axios"

const API = axios.create({
    baseURL: "http://localhost:4000/api/v1"
})

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