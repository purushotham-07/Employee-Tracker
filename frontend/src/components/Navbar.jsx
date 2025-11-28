import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import ThemeToggle from "./ThemeToggle";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="nav-logo">Employee Task Tracker</span>
        <NavLink to="/" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className="nav-link">
          Tasks
        </NavLink>
        <NavLink to="/employees" className="nav-link">
          Employees
        </NavLink>
      </div>

      <div className="nav-right">
        <ThemeToggle />
        {user && (
          <span className="nav-user">
            {user.username} ({user.role})
          </span>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
