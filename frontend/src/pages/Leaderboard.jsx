import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import "./Leaderboard.css";

const normalizeGenderKey = (gender) => {
  const normalized = String(gender || "").trim().toLowerCase();
  if (normalized === "m" || normalized === "male") return "male";
  if (normalized === "f" || normalized === "female") return "female";
  return normalized;
};

const genderLabel = {
  male: "Boys",
  female: "Girls",
};

const genderOrder = ["male", "female"];

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topAthletes, setTopAthletes] = useState([]);
  const [topSchools, setTopSchools] = useState([]);
  const [topSchoolsByGender, setTopSchoolsByGender] = useState({ male: [], female: [] });

  useEffect(() => {
    const normalizeTopSchoolsByGender = (groups) => {
      const normalized = { male: [], female: [] };
      Object.entries(groups || {}).forEach(([gender, schools]) => {
        const key = normalizeGenderKey(gender);
        if (!normalized[key]) normalized[key] = [];
        normalized[key] = Array.isArray(schools) ? schools : [];
      });
      return normalized;
    };

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost/Athletic-Meet-Management-Results-System/backend/dashboard/index.php");
        const payload = await res.json();

        if (payload.status !== "success") {
          setError(payload.message || "Unable to load leaderboard.");
        } else {
          setTopAthletes(payload.data.topAthletes || []);
          setTopSchools(payload.data.topSchools?.overall || []);
          setTopSchoolsByGender(normalizeTopSchoolsByGender(payload.data.topSchools?.byGender || {}));
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the server.");
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  return (
    <Layout>
      <div className="leaderboard-page">
        <div className="leaderboard-header">
          <div>
            <span className="eyebrow">Leaderboard</span>
            <h1>Top Performers</h1>
            <p className="description">
              Explore the highest scoring athletes and top schools across all meets. Use this page to compare performance and team ranking.
            </p>
          </div>

          <div className="leaderboard-summary">
            <span className="summary-pill">Athletes: {topAthletes.length}</span>
            <span className="summary-pill">Boys schools: {topSchoolsByGender.male?.length || 0}</span>
            <span className="summary-pill">Girls schools: {topSchoolsByGender.female?.length || 0}</span>
          </div>
        </div>

        {loading && <div className="loading-state">Loading leaderboard...</div>}
        {error && <div className="error-state">{error}</div>}

        {!loading && !error && (
          <div className="leaderboard-grid">
            <div className="leaderboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Top Athletes</h2>
                  <p className="panel-note">Ranked by total points scored across all results.</p>
                </div>
              </div>

              <ol className="leaderboard-list">
                {topAthletes.length > 0 ? (
                  topAthletes.map((athlete, index) => (
                    <li key={athlete.bib_no || index} className="leaderboard-item">
                      <span className="rank-badge">{index + 1}</span>
                      <div className="leaderboard-item-info">
                        <span className="leaderboard-item-title">{athlete.athlete_name}</span>
                        <span className="leaderboard-item-meta">{athlete.school_name || "No school"}</span>
                      </div>
                      <span className="leaderboard-item-score">{athlete.total_points || 0}</span>
                    </li>
                  ))
                ) : (
                  <div className="empty-state">No athlete leaderboard data available.</div>
                )}
              </ol>
            </div>

            <div className="leaderboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Top Schools</h2>
                  <p className="panel-note">Highest scoring schools by gender division.</p>
                </div>
              </div>

              {genderOrder.map((gender) => {
                const schools = topSchoolsByGender[gender] || [];
                const label = genderLabel[gender] || gender;

                return (
                  <section key={gender} className="gender-block">
                    <div className="gender-heading">
                      <span className="gender-title">{label} Schools</span>
                      <span className="gender-subtitle">Best {label.toLowerCase()} team points</span>
                    </div>
                    <ol className="leaderboard-list">
                      {schools.length > 0 ? (
                        schools.map((school, index) => (
                          <li key={school.school_id || index} className="leaderboard-item">
                            <span className="rank-badge">{index + 1}</span>
                            <div className="leaderboard-item-info">
                              <span className="leaderboard-item-title">{school.school_name}</span>
                              <span className="leaderboard-item-meta">{label} school points</span>
                            </div>
                            <span className="leaderboard-item-score">{school.total_points || 0}</span>
                          </li>
                        ))
                      ) : (
                        <div className="empty-state">No {label.toLowerCase()} school data available.</div>
                      )}
                    </ol>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
