import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button"; 
import { authFetch, getAuthHeaders } from "../services/api";
import "./EventAssignment.css";

const EventAssignment = () => {
  const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const [athletes, setAthletes] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentMeet, setCurrentMeet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBib, setSelectedBib] = useState("");
  const [selectedIndividualEvents, setSelectedIndividualEvents] = useState([]);
  const [selectedRelayEvents, setSelectedRelayEvents] = useState([]);

  const headers = getAuthHeaders();

  const fetchData = async () => {
    setLoading(true);
    try {
      const athleteRes = await authFetch(`${API_BASE}/athletes/get_all_athletes.php`, { method: "GET", headers });
      const athleteData = await athleteRes.json();
      if (athleteData.status === "success") setAthletes(athleteData.data || []);

      const dashboardRes = await authFetch(`${API_BASE}/dashboard/index.php`, { method: "GET", headers });
      const dashboardData = await dashboardRes.json();
      const meet = dashboardData.status === "success" ? (dashboardData.data?.currentMeet || null) : null;
      setCurrentMeet(meet);

      const eventsUrl = meet?.meet_id
        ? `${API_BASE}/events/list.php?meet_id=${meet.meet_id}`
        : `${API_BASE}/events/list.php`;

      const eventRes = await authFetch(eventsUrl, { method: "GET", headers });
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

  const currentAthlete = athletes.find(a => String(a.bib_no) === String(selectedBib));

  const assignedEventsList = currentAthlete?.assigned_event_ids 
    ? currentAthlete.assigned_event_ids.map(String) 
    : [];
    
  const maxLimit = 3;
  const alreadyAssignedCount = assignedEventsList.length;
  const remainingLimit = Math.max(0, maxLimit - alreadyAssignedCount);

  const filteredAthletes = athletes.filter((ath) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false; 

    const matchBib = String(ath.bib_no).toLowerCase().includes(query);
    const matchName = ath.name ? ath.name.toLowerCase().includes(query) : false;
    const matchSchool = ath.school_name ? ath.school_name.toLowerCase().includes(query) : false;

    return matchBib || matchName || matchSchool;
  });

  const eligibleEvents = events.filter(evt => {
    if (!currentAthlete) return false;

    const athleteAgeId = currentAthlete.agegroup_id;
    const athleteGender = currentAthlete.gender ? currentAthlete.gender.toLowerCase().trim() : "";
    const eventAgeGroupIds = evt.agegroup_ids;
    
    const eventGenderNames = Array.isArray(evt.gender_names) 
      ? evt.gender_names.map(g => String(g).toLowerCase().trim()) 
      : [];

    if (!athleteAgeId || !Array.isArray(eventAgeGroupIds)) return false;

    const matchesAge = eventAgeGroupIds.map(String).includes(String(athleteAgeId));
    const matchesGender = eventGenderNames.length === 0 || eventGenderNames.includes(athleteGender);
    const isAlreadyAssigned = assignedEventsList.includes(String(evt.event_id));

    return matchesAge && matchesGender && !isAlreadyAssigned;
  });

  const individualEvents = eligibleEvents.filter(evt => 
    evt.event_type && (evt.event_type.toLowerCase() === "track" || evt.event_type.toLowerCase() === "field")
  );

  const relayEvents = eligibleEvents.filter(evt => 
    evt.event_type && evt.event_type.toLowerCase() === "relay"
  );

  const handleIndividualCheck = (eventId) => {
    if (selectedIndividualEvents.includes(eventId)) {
      setSelectedIndividualEvents(selectedIndividualEvents.filter(id => id !== eventId));
    } else {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedBib) {
      setError("Please select an athlete first.");
      return;
    }

    if (!currentMeet?.meet_id) {
      setError("No ongoing meet found. Assignments can only be made while a meet is active.");
      return;
    }

    const payload = {
      bib_no: Number(selectedBib),
      meet_id: Number(currentMeet.meet_id),
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
        fetchData();
      } else {
        setError(data.message || "Assignment failed.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="event-assignment-page">
        {/* HEADER */}
        <div className="ea-header">
          <h1>Athlete Event Registration</h1>
          <p>Search an athlete to manage individual and relay entries simultaneously</p>
          {currentMeet ? (
            <p className="ea-active-meet-note">
              Registering for: <strong>{currentMeet.meet_name}</strong>
              {currentMeet.year && !String(currentMeet.meet_name).includes(String(currentMeet.year))
                ? ` (${currentMeet.year})`
                : ""}
            </p>
          ) : (
            !loading && (
              <p className="ea-inline-warning">
                No ongoing meet found. Start a meet before assigning athletes to events.
              </p>
            )
          )}
        </div>

        {/* MESSAGES */}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading system configuration details...</p>
        ) : (
          <form className="ea-form" onSubmit={handleSubmit}>
            
            {/* ATHLETE SEARCH INPUT */}
            <div className="ea-search-box">
              <input
                type="text"
                placeholder="🔍 Search Athlete by Bib No, Name, or School..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setSelectedBib("");
                  }
                }}
                className="ea-search-input"
              />

              {filteredAthletes.length > 0 && !selectedBib && (
                <div className="ea-search-dropdown">
                  {filteredAthletes.map((ath) => (
                    <div
                      key={ath.bib_no}
                      className="ea-search-result"
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
                <div className="ea-badge">
                  Assigned Age Division: <strong>{currentAthlete.age_group || currentAthlete.group_name || "Unassigned"}</strong>
                </div>

                {/* INDIVIDUAL EVENTS */}
                <div className="ea-section">
                  <h3>
                    Individual Events{" "}
                    {remainingLimit <= 0 ? (
                      <span className="ea-limit-alert">
                        (Maximum limit of 3 events reached)
                      </span>
                    ) : (
                      <span className="ea-limit-info">
                        (You can select up to <strong>{remainingLimit}</strong> more event{remainingLimit > 1 ? "s" : ""})
                      </span>
                    )}
                  </h3>

                  {individualEvents.length === 0 ? (
                    <p className="ea-empty">No individual track/field events found for this age group.</p>
                  ) : (
                    <div className="ea-grid">
                      {individualEvents.map((evt) => {
                        const isChecked = selectedIndividualEvents.includes(evt.event_id);
                        const isLimitReached = remainingLimit <= 0 || (!isChecked && selectedIndividualEvents.length >= remainingLimit);

                        return (
                          <label 
                            key={evt.event_id} 
                            className={`ea-card ${isChecked ? 'checked' : ''} ${isLimitReached ? 'disabled' : ''}`}
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
                <div className="ea-section">
                  <h3>Relay Events (Unlimited Selection)</h3>
                  {relayEvents.length === 0 ? (
                    <p className="ea-empty">No relay events found for this age group.</p>
                  ) : (
                    <div className="ea-grid">
                      {relayEvents.map((evt) => (
                        <label key={evt.event_id} className={`ea-card ${selectedRelayEvents.includes(evt.event_id) ? 'checked' : ''}`}>
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

            <Button className="ea-submit" type="submit" disabled={!selectedBib || !currentMeet?.meet_id}>
              Save All Assignments
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default EventAssignment;