import React, { useState } from "react";
import axios from "../api/axiosInstance";

const DEPARTMENTS = [
  "Software Development",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Customer Support",
  "Product Management",
  "Quality Assurance",
  "IT Operations",
  "Research & Development",
];

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    job_title: "",
    department: "",
    role: "employee",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("/auth/register/", formData);
      alert("Account created successfully!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Register error:", error.response?.data);

      const msg =
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        "Registration failed. Try again.";

      alert(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password2"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="job_title"
            placeholder="Job Title (Ex: Software Engineer)"
            value={formData.job_title}
            onChange={handleChange}
            required
          />

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button type="submit">Create Account</button>
        </form>

        <p className="auth-note">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
