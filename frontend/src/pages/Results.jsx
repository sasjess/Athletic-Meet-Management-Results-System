import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch } from "../services/api";
import "./Results.css";

// Age group configuration brought in to translate IDs to readable labels
const ageGroupOptions = [
  { id: "1", label: "Under 12" },
  { id: "3", label: "Under 14" },
  { id: "17", label: "Under 16" },
  { id: "18", label: "Under 18" },
  { id: "19", label: "Under 20" },
];

const ageGroupLabels = Object.fromEntries(
  ageGroupOptions.map((item) => [item.id, item.label]),
);

const Results = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const authorized = ["admin", "meet_manager", "data_entry_operator"].includes(user?.role);
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [meets, setMeets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Search States
  const [bibNo, setBibNo] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Form States for quick bulk submission
  const [showForm, setShowForm] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedStage, setSelectedStage] = useState("1"); // Locked to "1" for Final
  const [isFieldEvent, setIsFieldEvent] = useState(false);

  // Dynamic podium data captures
  const [podium, setPodium] = useState({
    p1: { bib: "", mark: "" },
    p2: { bib: "", mark: "" },
    p3: { bib: "", mark: "" },
  });

  const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const fetchInitialData = async () => {
    try {
      const response = await authFetch(`${API_BASE}/meet_events/index.php`);
      const payload = await response.json();
      if (payload.status === "success") {
        setMeets(payload.meets || []);
        setEvents(payload.events || []);
      }
    } catch (err) {
      console.error("Meta loading error:", err);
    }
  };

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

  useEffect(() => {
    fetchResults();
    if (authorized) {
      fetchInitialData();
    }
  }, []);

  // Monitor event changes to automatically toggle between Track (Time) and Field (Distance) inputs
  useEffect(() => {
    if (!selectedEvent) return;
    const currentEvent = events.find(e => String(e.event_id) === String(selectedEvent));
    if (currentEvent) {
      const isField = currentEvent.event_type.toLowerCase().includes("field") || 
                      currentEvent.event_name.toLowerCase().includes("jump") || 
                      currentEvent.event_name.toLowerCase().includes("throw");
      setIsFieldEvent(isField);
    }
  }, [selectedEvent, events]);

  const handlePodiumChange = (place, field, value) => {
    setPodium(prev => ({
      ...prev,
      [place]: { ...prev[place], [field]: value }
    }));
  };

  const submitPodiumResults = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");

    if (!selectedMeet || !selectedEvent || !selectedAgeGroup) {
      setError("Please fill out all Meet, Event, and Age Group fields.");
      return;
    }

    const podiumRows = [];
    const positions = ["p1", "p2", "p3"];

    for (let i = 0; i < positions.length; i++) {
      const pKey = positions[i];
      const posData = podium[pKey];
      
      if (posData.bib) {
        podiumRows.push({
          bib_no: Number(posData.bib),
          position: i + 1,
          performance_time: !isFieldEvent ? parseFloat(posData.mark) : null,
          performance_distance: isFieldEvent ? parseFloat(posData.mark) : null,
          points: i === 0 ? 5.00 : i === 1 ? 3.00 : 1.00
        });
      }
    }

    if (podiumRows.length === 0) {
      setError("Please insert at least one athlete entry.");
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/results/create_podium.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meet_id: Number(selectedMeet),
          event_id: Number(selectedEvent),
          agegroup_id: Number(selectedAgeGroup),
          stage_id: Number(selectedStage), // Sending "1" for Final
          heat_no: 1, // Default fallback heat configuration
          results: podiumRows
        })
      });

      const payload = await response.json();
      if (payload.status === "success") {
        setSuccessMsg("Podium results successfully processed!");
        setPodium({ p1: { bib: "", mark: "" }, p2: { bib: "", mark: "" }, p3: { bib: "", mark: "" } });
        setShowForm(false);
        fetchResults();
      } else {
        setError(payload.message || "Failed saving bulk records.");
      }
    } catch (err) {
      setError(err.message || "Network processing error.");
    } finally {
      setLoading(false);
    }
  };

  const searchByBib = async () => {
    if (!bibNo) return fetchResults();
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE}/results/get_by_athlete.php?bib_no=${encodeURIComponent(bibNo)}`);
      const payload = await response.json();
      setResults(payload.status === "success" ? payload.data || [] : []);
    } catch (err) {
      setError("Error searching by bib number");
    }
    setLoading(false);
  };

  const searchBySchool = async () => {
    if (!schoolName) return fetchResults();
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE}/results/get_by_school.php?school_name=${encodeURIComponent(schoolName)}`);
      const payload = await response.json();
      setResults(payload.status === "success" ? payload.data || [] : []);
    } catch (err) {
      setError("Error searching by school name");
    }
    setLoading(false);
  };

  const getAllowedAgeGroups = () => {
    const currentEvent = events.find(e => String(e.event_id) === String(selectedEvent));
    if (!currentEvent || !currentEvent.allowed_agegroups) return [];
    return currentEvent.allowed_agegroups.split(",").map(id => id.trim());
  };

  return (
    <Layout>
      <div className="results-page">
        <div className="results-header">
          <div>
            <h1>Results Sheet</h1>
            <p>Public track & field rankings overview.</p>
          </div>
          <div className="results-actions">
            {authorized && (
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close Form" : "+ Add Podium Results"}
              </Button>
            )}
          </div>
        </div>

        {successMsg && <div className="success-message">{successMsg}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* PODIUM QUICK INSERT CARD PANEL */}
        {showForm && authorized && (
          <form className="podium-insert-card" onSubmit={submitPodiumResults}>
            <h2>Bulk Entry: 1st, 2nd & 3rd Places</h2>
            <div className="form-meta-selectors">
              <select value={selectedMeet} onChange={(e) => setSelectedMeet(e.target.value)} required>
                <option value="">Select Meet Context</option>
                {meets.map(m => <option key={m.meet_id} value={m.meet_id}>{m.meet_name} ({m.year})</option>)}
              </select>

              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} required>
                <option value="">Select Event Profile</option>
                {events.map(e => <option key={e.event_id} value={e.event_id}>{e.event_name} ({e.event_type})</option>)}
              </select>

              <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} required disabled={!selectedEvent}>
                <option value="">Select Age Group</option>
                {getAllowedAgeGroups().map(id => (
                  <option key={id} value={id}>
                    {ageGroupLabels[id] || `Under ${id}`}
                  </option>
                ))}
              </select>

              {/* STAGE DROPDOWN - LOCKED TO FINAL */}
              <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} required>
                <option value="1">Final</option>
              </select>
            </div>

            <hr className="divider" />

            <div className="podium-grid">
              {/* 1st Place Inputs */}
              <div className="podium-row-input gold">
                <span className="medal-badge">🥇 1st Place</span>
                <input type="number" placeholder="Bib No" value={podium.p1.bib} onChange={e => handlePodiumChange("p1", "bib", e.target.value)} required />
                <input type="number" step="0.001" placeholder={isFieldEvent ? "Distance (m)" : "Time (s)"} value={podium.p1.mark} onChange={e => handlePodiumChange("p1", "mark", e.target.value)} required />
              </div>

              {/* 2nd Place Inputs */}
              <div className="podium-row-input silver">
                <span className="medal-badge">🥈 2nd Place</span>
                <input type="number" placeholder="Bib No" value={podium.p2.bib} onChange={e => handlePodiumChange("p2", "bib", e.target.value)} />
                <input type="number" step="0.001" placeholder={isFieldEvent ? "Distance (m)" : "Time (s)"} value={podium.p2.mark} onChange={e => handlePodiumChange("p2", "mark", e.target.value)} />
              </div>

              {/* 3rd Place Inputs */}
              <div className="podium-row-input bronze">
                <span className="medal-badge">🥉 3rd Place</span>
                <input type="number" placeholder="Bib No" value={podium.p3.bib} onChange={e => handlePodiumChange("p3", "bib", e.target.value)} />
                <input type="number" step="0.001" placeholder={isFieldEvent ? "Distance (m)" : "Time (s)"} value={podium.p3.mark} onChange={e => handlePodiumChange("p3", "mark", e.target.value)} />
              </div>
            </div>

            <Button type="submit" disabled={loading}>Save Podium Placements</Button>
          </form>
        )}

        {/* SEARCH CONTROLS */}
        <div className="search-panel">
          <div className="search-card">
            <h2>Search by Bib Number</h2>
            <div className="search-row">
              <input type="number" placeholder="Search Bib..." value={bibNo} onChange={(e) => setBibNo(e.target.value)} />
              <Button onClick={searchByBib}>Filter</Button>
            </div>
          </div>

          <div className="search-card">
            <h2>Search by School Name</h2>
            <div className="search-row">
              <input type="text" placeholder="Search School..." value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              <Button onClick={searchBySchool}>Filter</Button>
            </div>
          </div>
        </div>

        {/* MAIN RESULTS SHEET OVERVIEW */}
        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank / Pos</th>
                <th>Bib</th>
                <th>Athlete Name</th>
                <th>School Name</th>
                <th>Event Details</th>
                <th>Performance Mark</th>
                <th>Points Earned</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8">Loading data rows...</td></tr>
              ) : results.length > 0 ? (
                results.map((result, index) => (
                  <tr key={result.id || index} className={`pos-${result.position}`}>
                    <td><strong>Place {result.position}</strong></td>
                    <td><span className="bib-tag">{result.bib_no}</span></td>
                    <td>{result.athlete_name || `Athlete #${result.bib_no}`}</td>
                    <td>{result.school_name || "Independent"}</td>
                    <td>{result.event_name}</td>
                    <td>
                      {result.performance_time 
                        ? `${parseFloat(result.performance_time).toFixed(2)}s` 
                        : result.performance_distance 
                          ? `${parseFloat(result.performance_distance).toFixed(2)}m` 
                          : "-"}
                    </td>
                    <td><span className="points-pill">+{parseFloat(result.points).toFixed(0)} pts</span></td>
                    <td>{result.created_at ? new Date(result.created_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8">No results found matching search parameters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Results;