import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import "./Dashboard.css";
import meetImage from "../assets/meet.jpg";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const authorized = ["admin", "meet_manager", "data_entry_operator"].includes(user?.role);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalSchools: 0, totalAthletes: 0, totalEvents: 0, totalResults: 0 });
  const [topSchools, setTopSchools] = useState({ overall: [], byGender: {} });
  const [topAthletes, setTopAthletes] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [pastMeets, setPastMeets] = useState([]);
  const [currentMeet, setCurrentMeet] = useState(null);

  const API = "http://localhost/Athletic-Meet-Management-Results-System/backend/dashboard/index.php";

  const statusColor = (status) => {
    if (status === "Active" || status === "Ongoing") return "#22c55e";
    if (status === "Upcoming") return "#3b82f6";
    if (status === "Completed") return "#6b7280";
    return "#888";
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Please log in to view dashboard stats.");
          return;
        }

        const payload = await res.json();

        if (payload.status !== "success") {
          setError(payload.message || "Failed to load dashboard");
        } else {
          const d = payload.data;
          setStats(d.stats || {});
          setTopSchools(d.topSchools || { overall: [], byGender: {} });
          setTopAthletes(d.topAthletes || []);
          setRecentResults(d.recentResults || []);
          setPastMeets(d.pastMeets || []);
          setCurrentMeet(d.currentMeet || null);
        }

      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching dashboard");
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [token]);

  const meetDates = currentMeet
    ? `${currentMeet.start_date || ""}${currentMeet.end_date ? ` - ${currentMeet.end_date}` : ""}`
    : "No meet dates available";

  return (
    <Layout>
      <header className="dash-header">
        <div>
          <p className="eyebrow">Athletic Meet Management</p>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">
            {authorized
              ? `Welcome back, ${user.username} (${user.role.replace("_", " ")}).`
              : "Browse results, leaderboards, and past meets. Login to manage data."}
          </p>
        </div>

        {user && (
          <div className="header-account">
            <span className="header-account-label">Signed in as</span>
            <strong className="header-account-name">{user.username}</strong>
          </div>
        )}
      </header>

      {loading && <div className="dashboard-alert dashboard-loading">Loading dashboard data…</div>}
      {error && <div className="dashboard-alert dashboard-error">{error}</div>}

      {!authorized && (
        <div className="public-notice">
          Public visitors can view results and use the search tools on the Results page. Login with an authorized account to create, update, or delete entries.
        </div>
      )}

     <section className="dashboard-hero-card">
  <div
    className="hero-left"
    style={{
      backgroundImage: `linear-gradient(
        rgba(0,0,0,0.45),
        rgba(0,0,0,0.45)
      ), url(${meetImage})`,
    }}
  >
    <span
      className={`hero-badge ${
        currentMeet?.status?.toLowerCase() || "inactive"
      }`}
    >
      {currentMeet ? currentMeet.status : "No Active Meet"}
    </span>

    <h2>{currentMeet ? currentMeet.meet_name : "No active meet available"}</h2>

    <p>
      {currentMeet
        ? `Meet dates: ${meetDates}`
        : "Track results across your latest and past meets."}
    </p>

    <div className="hero-actions">
      <button
        className="hero-button"
        onClick={() => (window.location.href = "/results")}
      >
        View Results
      </button>

      <button
        className="hero-button secondary"
        onClick={() => (window.location.href = "/past-meets")}
      >
        Past Meets
      </button>
    </div>
  </div>

  <div className="hero-metrics">
    <div className="metric-card">
      <span>Total Schools</span>
      <strong>{stats.totalSchools}</strong>
    </div>

    <div className="metric-card">
      <span>Total Athletes</span>
      <strong>{stats.totalAthletes}</strong>
    </div>

    <div className="metric-card">
      <span>Total Events</span>
      <strong>{stats.totalEvents}</strong>
    </div>

    <div className="metric-card">
      <span>Total Results</span>
      <strong>{stats.totalResults}</strong>
    </div>
  </div>
</section>

      <section className="panel-grid">
        <div className="panel leaderboard-panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title">Leaderboard</h2>
              <p className="section-description">Top athletes and schools by score.</p>
            </div>
            <button className="view-all-btn" onClick={() => (window.location.href = "/leaderboard")}>View All</button>
          </div>

          <div className="leaderboard-grid">
            <div className="leaderboard-card compact">
              <h3>Top Athletes</h3>
              <ol className="leaderboard-list">
                {topAthletes.length > 0 ? (
                  topAthletes.map((athlete, index) => (
                    <li key={athlete.bib_no || index}>
                      <span>{athlete.athlete_name}</span>
                      <strong>{athlete.total_points}</strong>
                    </li>
                  ))
                ) : (
                  <li>No leaderboard data available.</li>
                )}
              </ol>
            </div>

            <div className="leaderboard-card compact">
              <h3>Top Schools</h3>
              <ol className="leaderboard-list">
                {topSchools.overall.length > 0 ? (
                  topSchools.overall.map((school, index) => (
                    <li key={school.school_id || index}>
                      <span>{school.school_name}</span>
                      <strong>{school.total_points}</strong>
                    </li>
                  ))
                ) : (
                  <li>No school leaderboard data available.</li>
                )}
              </ol>
            </div>
          </div>
        </div>

        <div className="panel meets-panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title">Past Meets</h2>
              <p className="section-description">Completed meets with recent results.</p>
            </div>
            <button className="view-all-btn" onClick={() => (window.location.href = "/past-meets")}>View All</button>
          </div>

          <div className="past-meets-list">
            {pastMeets.length > 0 ? (
              pastMeets.map((meet, idx) => (
                <div key={meet.meet_id || idx} className="meet-row">
                  <div>
                    <strong>{meet.meet_name}</strong>
                    <p>{meet.year} · {meet.start_date || ""}{meet.end_date ? ` - ${meet.end_date}` : ""}</p>
                  </div>
                  
                  <span className="meet-status" style={{ color: statusColor(meet.status) }}>{meet.status}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No past meets available.</div>
            )}
          </div>
        </div>
      </section>

      <section className="panel recent-results-panel">
        <div className="panel-header">
          <div>
            <h2 className="section-title">Recent Results</h2>
            <p className="section-description">Latest performances from your current meet.</p>
          </div>
          <button className="view-all-btn" onClick={() => window.location.href = "/results"}>
            View All
          </button>
        </div>

        <div className="table-wrapper">
          <table className="athletes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Athlete</th>
                <th>Event</th>
                <th>Performance</th>
                <th>Points</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {recentResults.length > 0 ? (
                recentResults.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="athlete-name-cell">
                        <div className="athlete-avatar">{r.athlete_name?.slice(0, 1) || "A"}</div>
                        <div>
                          <strong>{r.athlete_name}</strong>
                          <div className="athlete-meta">{r.school_name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.event_name}</td>
                    <td>{r.performance_time ? `${r.performance_time}s` : (r.performance_distance ? `${r.performance_distance}m` : "-")}</td>
                    <td>{r.points ?? "-"}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No recent results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;