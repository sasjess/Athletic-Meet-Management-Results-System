import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button"; 
import { authFetch, getAuthHeaders } from "../services/api";
import "./EventAssignment.css";

const EventAssignment = () => {
  const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const [athletes, setAthletes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search and selection states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBib, setSelectedBib] = useState("");
  const [selectedIndividualEvents, setSelectedIndividualEvents] = useState([]);
  const [selectedRelayEvents, setSelectedRelayEvents] = useState([]);

  const headers = getAuthHeaders();

  // Helper function to fetch data and refresh athlete assignments
  const fetchData = async () => {
    setLoading(true);
    try {
      const athleteRes = await authFetch(`${API_BASE}/athletes/get_all_athletes.php`, { method: "GET", headers });
      const athleteData = await athleteRes.json();
      if (athleteData.status === "success") setAthletes(athleteData.data || []);

      const eventRes = await authFetch(`${API_BASE}/events/list.php`, { method: "GET", headers });
      const eventData = await eventRes.json();
      if (eventData.status === "success") setEvents(eventData.data || []);
    } catch (err) {
      setError("Failed to load setup options: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Find currently selected athlete details to auto-detect their age group
  const currentAthlete = athletes.find(a => String(a.bib_no) === String(selectedBib));

 
  // ===================================
  // DYNAMIC ASSIGNMENT LIMIT CALCULATIONS
  // ===================================
  // We assume the backend provides the already assigned event IDs in an array on the athlete object.
  // If undefined, fallback to an empty array.
  const assignedEventsList = currentAthlete?.assigned_event_ids 
    ? currentAthlete.assigned_event_ids.map(String) 
    : [];
    
  const maxLimit = 3;
  const alreadyAssignedCount = assignedEventsList.length;
  const remainingLimit = Math.max(0, maxLimit - alreadyAssignedCount);

  // ============================
  // SEARCH / FILTER ATHLETES (Real-time)
  // ============================
  const filteredAthletes = athletes.filter((ath) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false; 

    const matchBib = String(ath.bib_no).toLowerCase().includes(query);
    const matchName = ath.name ? ath.name.toLowerCase().includes(query) : false;
    const matchSchool = ath.school_name ? ath.school_name.toLowerCase().includes(query) : false;

    return matchBib || matchName || matchSchool;
  });

  // ============================
  // ROBUST AGE GROUP, GENDER & ALREADY REGISTERED FILTERING
  // ============================
  const eligibleEvents = events.filter(evt => {
    if (!currentAthlete) return false;

    const athleteAgeId = currentAthlete.agegroup_id;
    const athleteGender = currentAthlete.gender ? currentAthlete.gender.toLowerCase().trim() : "";
    const eventAgeGroupIds = evt.agegroup_ids;
    
    // Normalize gender values
    const eventGenderNames = Array.isArray(evt.gender_names) 
      ? evt.gender_names.map(g => String(g).toLowerCase().trim()) 
      : [];

    if (!athleteAgeId || !Array.isArray(eventAgeGroupIds)) return false;

    // 1. Strict match Age group
    const matchesAge = eventAgeGroupIds.map(String).includes(String(athleteAgeId));
    
    // 2. Match Gender
    const matchesGender = eventGenderNames.length === 0 || eventGenderNames.includes(athleteGender);

    // 3. EXCLUDE events this athlete has already registered for in the past
    const isAlreadyAssigned = assignedEventsList.includes(String(evt.event_id));

    return matchesAge && matchesGender && !isAlreadyAssigned;
  });

  const individualEvents = eligibleEvents.filter(evt => 
    evt.event_type && (evt.event_type.toLowerCase() === "track" || evt.event_type.toLowerCase() === "field")
  );

  const relayEvents = eligibleEvents.filter(evt => 
    evt.event_type && evt.event_type.toLowerCase() === "relay"
  );

  // ============================
  // CHECKBOX SELECTION HANDLERS
  // ============================
  const handleIndividualCheck = (eventId) => {
    if (selectedIndividualEvents.includes(eventId)) {
      setSelectedIndividualEvents(selectedIndividualEvents.filter(id => id !== eventId));
    } else {
      // Direct inline guard using the dynamic remaining allowance limit
      if (selectedIndividualEvents.length >= remainingLimit) {
        alert(`Limit reached! This athlete can only assign ${remainingLimit} more individual event(s).`);
        return;
      }
      setSelectedIndividualEvents([...selectedIndividualEvents, eventId]);
    }
  };

  const handleRelayCheck = (eventId) => {
    if (selectedRelayEvents.includes(eventId)) {
      setSelectedRelayEvents(selectedRelayEvents.filter(id => id !== eventId));
    } else {
      setSelectedRelayEvents([...selectedRelayEvents, eventId]);
    }
  };

  // ============================
  // SUBMIT REGISTRATION
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedBib) {
      setError("Please select an athlete first.");
      return;
    }

    const payload = {
      bib_no: Number(selectedBib),
      individual_event_ids: selectedIndividualEvents.map(Number),
      relay_event_ids: selectedRelayEvents.map(Number),
    };

    try {
      const response = await authFetch(`${API_BASE}/assignments/assign_athlete_bulk.php`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(`Successfully registered assignments for Bib No: ${selectedBib}`);
        setSelectedBib("");
        setSearchQuery("");
        setSelectedIndividualEvents([]);
        setSelectedRelayEvents([]);
        
        // Refresh the athletes data so their assigned event list updates instantly in state
        fetchData();
      } else {
        setError(data.message || "Assignment failed.");
      }
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
  if (currentAthlete) {
    console.log("--- SELECTED ATHLETE DATA ---");
    console.log(currentAthlete);
  }
}, [currentAthlete]);

  return (
    <Layout>
      <div className="athletes-page">
        {/* HEADER */}
        <div className="header">
          <h1>Athlete Event Registration</h1>
          <p>Search an athlete to manage individual and relay entries simultaneously</p>
        </div>

        {/* MESSAGES */}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading system configuration details...</p>
        ) : (
          <form className="athlete-form display-block-form" onSubmit={handleSubmit}>
            
            {/* ATHLETE SEARCH INPUT */}
            <div className="search-selection-box">
              <input
                type="text"
                placeholder="🔍 Search Athlete by Bib No, Name, or School..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setSelectedBib(""); // Clear selection if input is entirely cleared
                  }
                }}
                className="search-input"
              />

              {/* SEARCH RESULTS SUGGESTION DROPDOWN BOX */}
              {filteredAthletes.length > 0 && !selectedBib && (
                <div className="search-results-dropdown">
                  {filteredAthletes.map((ath) => (
                    <div
                      key={ath.bib_no}
                      className="search-result-item"
                      onClick={() => {
                        setSelectedBib(ath.bib_no);
                        setSearchQuery(`[${ath.bib_no}] ${ath.name} — ${ath.school_name}`);
                        setSelectedIndividualEvents([]);
                        setSelectedRelayEvents([]);
                      }}
                    >
                      <strong>[{ath.bib_no}]</strong> {ath.name} — <small>{ath.school_name}</small> ({ath.age_group || "No Age Group"})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedBib && currentAthlete && (
              <>
                <div className="athlete-meta-badge">
                  Assigned Age Division: <strong>{currentAthlete.age_group || currentAthlete.group_name || "Unassigned"}</strong>
                </div>

                {/* INDIVIDUAL EVENTS */}
                <div className="checkbox-section">
                  {/* DYNAMIC HEADER */}
                  <h3>
                    Individual Events{" "}
                    {remainingLimit <= 0 ? (
                      <span className="limit-alert" style={{ color: "#d9534f", fontSize: "0.85em", marginLeft: "10px" }}>
                        (Maximum limit of 3 events reached)
                      </span>
                    ) : (
                      <span className="limit-info" style={{ color: "#5cb85c", fontSize: "0.85em", marginLeft: "10px" }}>
                        (You can select up to <strong>{remainingLimit}</strong> more event{remainingLimit > 1 ? "s" : ""})
                      </span>
                    )}
                  </h3>

                  {individualEvents.length === 0 ? (
                    <p className="no-data-msg">No individual track/field events found for this age group.</p>
                  ) : (
                    <div className="checkbox-grid">
                      {individualEvents.map((evt) => {
                        const isChecked = selectedIndividualEvents.includes(evt.event_id);
                        
                        // Disable if the athlete is completely full, OR if they selected their maximum screen allowance
                        const isLimitReached = remainingLimit <= 0 || (!isChecked && selectedIndividualEvents.length >= remainingLimit);

                        return (
                          <label 
                            key={evt.event_id} 
                            className={`checkbox-card ${isChecked ? 'checked' : ''} ${isLimitReached ? 'disabled' : ''}`}
                            style={isLimitReached ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isLimitReached}
                              onChange={() => handleIndividualCheck(evt.event_id)}
                            />
                            <span>{evt.event_name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* RELAY EVENTS */}
                <div className="checkbox-section">
                  <h3>Relay Events (Unlimited Selection)</h3>
                  {relayEvents.length === 0 ? (
                    <p className="no-data-msg">No relay events found for this age group.</p>
                  ) : (
                    <div className="checkbox-grid">
                      {relayEvents.map((evt) => (
                        <label key={evt.event_id} className={`checkbox-card ${selectedRelayEvents.includes(evt.event_id) ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selectedRelayEvents.includes(evt.event_id)}
                            onChange={() => handleRelayCheck(evt.event_id)}
                          />
                          <span>{evt.event_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ACTION BUTTON */}
            <Button className="btn-primary" type="submit" disabled={!selectedBib}>
              Save All Assignments
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default EventAssignment;