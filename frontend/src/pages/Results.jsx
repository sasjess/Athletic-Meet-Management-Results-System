import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { authFetch } from "../services/api";
import "./Results.css";

const Results = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const authorized = ["admin", "meet_manager", "data_entry_operator"].includes(user?.role);
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bibNo, setBibNo] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_BASE}/results/index.php`);
      const payload = await response.json();
      if (payload.status !== "success") {
        setError(payload.message || "Failed to load results");
        setResults([]);
      } else {
        setResults(payload.data || []);
      }
    } catch (err) {
      setError(err.message || "Error fetching results");
      setResults([]);
    }

    setLoading(false);
  };

  const searchByBib = async () => {
    if (!bibNo) {
      setError("Enter a bib number to search.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_BASE}/results/get_by_athlete.php?bib_no=${encodeURIComponent(bibNo)}`);
      const payload = await response.json();
      if (payload.status !== "success") {
        setError(payload.message || "No results found for that bib number.");
        setResults([]);
      } else {
        setResults(payload.data || []);
      }
    } catch (err) {
      setError(err.message || "Error searching by bib number");
    }

    setLoading(false);
  };

  const searchBySchool = async () => {
    if (!schoolName) {
      setError("Enter a school name to search.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_BASE}/results/get_by_school.php?school_name=${encodeURIComponent(schoolName)}`);
      const payload = await response.json();
      if (payload.status !== "success") {
        setError(payload.message || "No results found for that school.");
        setResults([]);
      } else {
        setResults(payload.data || []);
      }
    } catch (err) {
      setError(err.message || "Error searching by school name");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <Layout>
      <div className="results-page">
        <div className="results-header">
          <div>
            <h1>Results Sheet</h1>
            <p>Public results listing and search. Admin, meet manager, and data entry operator roles can create or manage results.</p>
          </div>

          <div className="results-actions">
            {authorized ? (
              <button className="primary-btn" onClick={() => navigate("/results/create")}>
                + Add Result
              </button>
            ) : (
              <button className="secondary-btn" onClick={() => navigate("/login")}>Login to manage</button>
            )}
          </div>
        </div>

        <div className="search-panel">
          <div className="search-card">
            <h2>Search by Bib Number</h2>
            <div className="search-row">
              <input
                type="number"
                placeholder="Enter bib number"
                value={bibNo}
                onChange={(e) => setBibNo(e.target.value)}
              />
              <button className="primary-btn" onClick={searchByBib}>
                Search
              </button>
            </div>
          </div>

          <div className="search-card">
            <h2>Search by School Name</h2>
            <div className="search-row">
              <input
                type="text"
                placeholder="Enter school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
              <button className="primary-btn" onClick={searchBySchool}>
                Search
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bib</th>
                <th>Athlete</th>
                <th>School</th>
                <th>Event</th>
                <th>Performance</th>
                <th>Points</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading...</td>
                </tr>
              ) : results.length > 0 ? (
                results.map((result, index) => (
                  <tr key={result.id || index}>
                    <td>{index + 1}</td>
                    <td>{result.bib_no}</td>
                    <td>{result.athlete_name || "-"}</td>
                    <td>{result.school_name || "-"}</td>
                    <td>{result.event_name || "-"}</td>
                    <td>{result.performance_time ? `${result.performance_time}s` : result.performance_distance ? `${result.performance_distance}m` : "-"}</td>
                    <td>{result.points ?? "-"}</td>
                    <td>{result.created_at ? new Date(result.created_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No results available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
