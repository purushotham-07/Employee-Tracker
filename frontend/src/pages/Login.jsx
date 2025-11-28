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
      // ---- 1) Get JWT tokens ----
      const res = await API.post("/token/", form);

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // ---- 2) Save tokens in correct key format ----
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // ---- 3) Fetch logged-in user data ----
      const meRes = await API.get("/auth/me/");
      const user = meRes.data;

      // ---- 4) Store in Redux ----
      dispatch(loginSuccess({ accessToken, refreshToken, user }));

      // ---- 5) Store user locally optional ----
      localStorage.setItem("user", JSON.stringify(user));

      // ---- Redirect to Dashboard ----
      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid username or password");
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
