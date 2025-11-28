import axios from "axios";

const API = axios.create({
  baseURL: "https://employee-tracker-backend.onrender.com/api",
});


// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
