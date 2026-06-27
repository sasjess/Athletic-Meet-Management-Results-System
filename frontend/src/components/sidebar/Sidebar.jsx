import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  // get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Athletes", path: "/athletes" },
    { name: "Results", path: "/results" },
    { name: "Schools", path: "/schools" },
    { name: "Meets", path: "/meets" },
    { name: "Events", path: "/events" },
    { name: "About", path: "/about" },
    { name: "Login", path: "/login" },
  ];

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        <span className="logo-icon">🏅</span>
        <span className="logo-text">AthleteHub</span>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-item nav-active" : "nav-item"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* USER INFO */}
      <div className="sidebar-footer">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="user-info">
          <span className="user-name">
            {user?.username || "Guest"}
          </span>

          <span className="user-role">
            {user?.role || "No Role"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;