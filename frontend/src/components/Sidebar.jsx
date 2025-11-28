import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/layout.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-link">
        📊 Dashboard
      </NavLink>
      <NavLink to="/tasks" className="sidebar-link">
        ✅ Tasks
      </NavLink>
      <NavLink to="/employees" className="sidebar-link">
        👥 Employees
      </NavLink>
    </aside>
  );
}
