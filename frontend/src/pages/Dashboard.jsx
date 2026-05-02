import React, { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navItems = ["Dashboard", "Athletes", "Schedule", "Reports", "Settings"];

  const stats = [
    { label: "Total Athletes", value: "128", icon: "🏃", change: "+4 this week" },
    { label: "Active Sessions", value: "12", icon: "⚡", change: "Live now" },
    { label: "Upcoming Events", value: "5", icon: "📅", change: "Next 7 days" },
    { label: "Avg Performance", value: "87%", icon: "📈", change: "+2.3% this month" },
  ];

  const recentAthletes = [
    { name: "Ashan Perera", sport: "Swimming", status: "Active", score: 92 },
    { name: "Nimali Silva", sport: "Athletics", status: "Active", score: 88 },
    { name: "Kasun Fernando", sport: "Cycling", status: "Resting", score: 75 },
    { name: "Dilani Wickrama", sport: "Gymnastics", status: "Active", score: 95 },
    { name: "Roshan Jayasena", sport: "Football", status: "Injured", score: 60 },
  ];

  const statusColor = (status) => {
    if (status === "Active") return "#22c55e";
    if (status === "Resting") return "#f59e0b";
    if (status === "Injured") return "#ef4444";
    return "#888";
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🏅</span>
          <span className="logo-text">AthleteHub</span>
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
        <div className="sidebar-footer">
          <div className="user-avatar">JP</div>
          <div className="user-info">
            <span className="user-name">John P.</span>
            <span className="user-role">Admin</span>
          </div>
          <button className="logout-btn" title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Welcome back, John. Here's what's happening today.</p>
          </div>
          <button className="add-btn">+ Add Athlete</button>
        </header>

        {/* Stats Cards */}
        <section className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Athletes Table */}
        <section className="table-section">
          <div className="table-header">
            <h2 className="section-title">Recent Athletes</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-wrapper">
            <table className="athletes-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sport</th>
                  <th>Status</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {recentAthletes.map((athlete) => (
                  <tr key={athlete.name}>
                    <td>
                      <div className="athlete-name-cell">
                        <div className="athlete-avatar">
                          {athlete.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        {athlete.name}
                      </div>
                    </td>
                    <td>{athlete.sport}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColor(athlete.status) + "22", color: statusColor(athlete.status) }}
                      >
                        {athlete.status}
                      </span>
                    </td>
                    <td>
                      <div className="perf-bar-wrapper">
                        <div
                          className="perf-bar"
                          style={{ width: `${athlete.score}%` }}
                        />
                        <span className="perf-label">{athlete.score}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;