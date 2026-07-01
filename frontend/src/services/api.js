import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

export const registerUser = (userData) => {
  return API.post("/register", userData);
};

export const loginUser = (userData) => {
  return API.post("/login", userData);
};

export const verifyEmail = (token) => {
  return API.get(`/verify-email/${token}`);
};

export const getProfile = () => {
  return API.get("/users/profile");
};

export const updateProfile = (profileData) => {
  return API.put("/users/profile", profileData);
};

export const uploadProfileImage = (imageFile) => {
  const formData = new FormData();

  formData.append("image", imageFile);
  
  return API.post("/users/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
