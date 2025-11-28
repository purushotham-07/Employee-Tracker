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
      // Get JWT Tokens
      const res = await API.post("token/", form);  // <<< no leading slash!
      const access = res.data.access;
      const refresh = res.data.refresh;

      // Save to LocalStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Fetch logged-in user details
      const userResponse = await API.get("auth/me/");
      const user = userResponse.data;

      // Save user in Redux
      dispatch(loginSuccess({ token: access, user }));

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect after success
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      alert("Invalid credentials or server issue");
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
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            required
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
