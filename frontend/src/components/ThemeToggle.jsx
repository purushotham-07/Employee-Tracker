import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggle = () =>
    setTheme(theme === "light" ? "dark" : "light");

  return (
    <button className="theme-btn" onClick={toggle}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
