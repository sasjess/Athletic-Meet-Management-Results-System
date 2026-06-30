import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const authorized = ["admin", "meet_manager", "data_entry_operator"].includes(user?.role);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Results", path: "/results" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Past Meets", path: "/past-meets" },
    { name: "About", path: "/about" },
  ];

  const adminItems = authorized
    ? [
        { name: "Athletes", path: "/athletes" },
        { name: "Schools", path: "/schools" },
        { name: "Meets", path: "/meets" },
        { name: "Events", path: "/events" },
      ]
    : [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🏅</span>
        <span className="logo-text">AthleteHub</span>
      </div>

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

        {adminItems.length > 0 && (
          <>
            <div className="sidebar-section-title">Manage</div>
            {adminItems.map((item) => (
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
          </>
        )}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-footer">
        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? "nav-item nav-active login-link" : "nav-item login-link"
            }
          >
            Login
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
