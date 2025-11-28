import React, { useState } from "react";
import API from "../api/axiosInstance";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import "../styles/layout.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Generate JWT Token
      const res = await API.post("/token/", form);
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // Save tokens in correct format for axios interceptor
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // 2) Fetch user details
      const meRes = await API.get("/auth/me/");
      const user = meRes.data;

      // Save to Redux store
      dispatch(loginSuccess({ token: accessToken, user }));

      // Save user locally too
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={form.username}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-note">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
