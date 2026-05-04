import React, { useState } from "react";
import "./../../pages/Dashboard.css";

// Meke nama "Layout" kiyala danna
const Layout = ({ children }) => {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const navItems = ["Dashboard", "Athletes", "Schedule", "Reports", "Settings"];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🏅</span>
          <span className="logo-text">AthleteX</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activeNav === item ? "nav-active" : ""}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;