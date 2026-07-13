import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch } from "../services/api";
import "./AssignEventsToMeet.css";

const API_BASE =
  "http://localhost/Athletic-Meet-Management-Results-System/backend";

const ageGroupOptions = [
  { id: "1", label: "Under 12" },
  { id: "3", label: "Under 14" },
  { id: "17", label: "Under 16" },
  { id: "18", label: "Under 18" },
  { id: "19", label: "Under 20" },
];

const genderOptions = [
  { id: "M", label: "Male" },
  { id: "F", label: "Female" },
];

const ageGroupLabels = Object.fromEntries(
  ageGroupOptions.map((item) => [item.id, item.label]),
);

const genderLabels = Object.fromEntries(
  genderOptions.map((item) => [item.id, item.label]),
);

const AssignEventsToMeet = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || localStorage.getItem("role") || "";

  const [meets, setMeets] = useState([]);
  const [events, setEvents] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);

  const [searchMeet, setSearchMeet] = useState("");

  const [form, setForm] = useState({
    meet_id: "",
    event_ids: [],
    agegroup_ids: [],
    gender_id: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isAgeGroupOpen, setIsAgeGroupOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const eventDropdownRef = useRef(null);
  const ageGroupDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);

  const loadData = async () => {
    try {
      const response = await authFetch(`${API_BASE}/meet_events/index.php`);
      const data = await response.json();

      if (data.status === "success") {
        setMeets(data.meets || []);
        setEvents(data.events || []);
      } else {
        setError(data.message || "Failed loading data");
      }
    } catch (error) {
      console.error(error);
      setError("Cannot load meet and event data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEventOpen && eventDropdownRef.current && !eventDropdownRef.current.contains(event.target)) {
        setIsEventOpen(false);
      }
      if (isAgeGroupOpen && ageGroupDropdownRef.current && !ageGroupDropdownRef.current.contains(event.target)) {
        setIsAgeGroupOpen(false);
      }
      if (isGenderOpen && genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEventOpen, isAgeGroupOpen, isGenderOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => {
        const current = Array.isArray(prev[name]) ? prev[name] : [];
        const updated = checked
          ? [...current, value]
          : current.filter((item) => item !== value);

        // Reset sub-options if events are changed
        if (name === "event_ids") {
          return {
            ...prev,
            [name]: updated,
            agegroup_ids: [], // Reset selected age groups when events alter
          };
        }

        return { ...prev, [name]: updated };
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const searchAssignedMeet = async () => {
    if (!searchMeet.trim()) {
      setAssignedEvents([]);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const url = `${API_BASE}/meet_events/index.php?search=${encodeURIComponent(searchMeet)}`;
      const response = await authFetch(url);
      const data = await response.json();

      if (data.status === "success") {
        setAssignedEvents(data.assignedEvents || []);
        if (!data.assignedEvents || data.assignedEvents.length === 0) {
          setError(`No events have been assigned to ${searchMeet}`);
        }
      } else {
        setAssignedEvents([]);
        setError(data.message || "Failed loading assigned events");
      }
    } catch (error) {
      console.error("SEARCH ERROR:", error);
      setAssignedEvents([]);
      setError("Failed fetching assigned events");
    } finally {
      setLoading(false);
    }
  };

  const validateSelectedEvents = () => {
    if (form.event_ids.length <= 1) return true;

    const selectedEvents = form.event_ids
      .map((id) => uniqueEvents.find((event) => String(event.event_id) === String(id)))
      .filter(Boolean);

    if (selectedEvents.length <= 1) return true;

    const ageGroupSets = selectedEvents.map((event) =>
      event.allowed_agegroups
        ? event.allowed_agegroups.split(",").map((id) => id.trim())
        : [],
    );

    const firstSet = ageGroupSets[0];
    const compatible = ageGroupSets.every(
      (set) =>
        set.length === firstSet.length &&
        set.every((id) => firstSet.includes(id)),
    );

    if (!compatible) {
      const messages = selectedEvents.map((event) => {
        const ages = event.allowed_agegroups
          ? event.allowed_agegroups
              .split(",")
              .map((id) => ageGroupLabels[id])
              .join(", ")
          : "No age restriction";

        return `${event.event_name} is allowed for ${ages}`;
      });

      setError(
        messages.join(" | ") +
          ". These events cannot be assigned together. Please assign them separately.",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.meet_id) return setError("Please select a meet");
    if (form.event_ids.length === 0) return setError("Please select at least one event");
    if (form.agegroup_ids.length === 0) return setError("Please select at least one age group");
    if (form.gender_id.length === 0) return setError("Please select at least one gender");

    if (!validateSelectedEvents()) return;

    try {
      setLoading(true);
      const response = await authFetch(`${API_BASE}/meet_events/index.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meet_id: Number(form.meet_id),
          event_ids: form.event_ids.map(Number),
          agegroup_ids: form.agegroup_ids.map(Number),
          gender_id: form.gender_id,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage("Event assigned successfully!");
        
        // Find the name of the meet we just added events to
        const activeMeet = meets.find(m => String(m.meet_id) === String(form.meet_id));
        
        // Reset creation form
        setForm({
          meet_id: "",
          event_ids: [],
          agegroup_ids: [],
          gender_id: [],
        });

        // Auto-refresh the search grid matching the newly updated meet
        if (activeMeet) {
          setSearchMeet(activeMeet.meet_name);
          setTimeout(() => searchAssignedMeet(), 50); 
        }
      } else {
        setError(data.message || "Assignment failed");
      }
    } catch (error) {
      console.error("SUBMIT ERROR:", error);
      setError(error.message || "Failed submitting assignment matrix.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueEvents = Array.from(
    new Map(
      events.map((event) => [
        `${event.event_name.replace(/\s+/g, "").toLowerCase()}-${event.event_type.replace(/\s+/g, "").toLowerCase()}`,
        event,
      ]),
    ).values(),
  );

  const selectedEventNames = form.event_ids
    .map((id) => uniqueEvents.find((e) => String(e.event_id) === String(id))?.event_name)
    .filter(Boolean);

  const selectedAgeGroupLabels = form.agegroup_ids.map((id) => ageGroupLabels[id]).filter(Boolean);
  const selectedGenderLabels = form.gender_id.map((id) => genderLabels[id]).filter(Boolean);

  const allowedAgeGroups = ageGroupOptions.filter((option) => {
    return form.event_ids.some((eventId) => {
      const event = uniqueEvents.find((e) => String(e.event_id) === String(eventId));
      if (!event || !event.allowed_agegroups) return false;
      const allowed = event.allowed_agegroups.split(",").map((id) => id.trim());
      return allowed.includes(option.id);
    });
  });

  return (
    <Layout>
      <div className="assign-events-page">
        <h1>Assign Events To Meets</h1>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {userRole === "admin" && (
          <form className="event-form" onSubmit={handleSubmit}>
            <select name="meet_id" value={form.meet_id} onChange={handleChange}>
              <option value="">Select Meet</option>
              {meets.map((meet) => (
                <option key={meet.meet_id} value={meet.meet_id}>
                  {meet.meet_name} ({meet.year})
                </option>
              ))}
            </select>

            {/* EVENTS PICKER */}
            <div className="age-group-picker" ref={eventDropdownRef}>
              <button
                type="button"
                className="age-group-toggle"
                onClick={() => setIsEventOpen((prev) => !prev)}
              >
                {selectedEventNames.length ? selectedEventNames.join(", ") : "Select events"}
                <span>▾</span>
              </button>

              {isEventOpen && (
                <div className="age-group-menu">
                  {uniqueEvents.map((event) => {
                    const checked = form.event_ids.includes(String(event.event_id));
                    return (
                      <label key={event.event_id} className="checkbox-item">
                        <input
                          type="checkbox"
                          name="event_ids"
                          value={event.event_id}
                          checked={checked}
                          onChange={handleChange}
                        />
                        {event.event_name} ({event.event_type})
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AGE GROUP PICKER */}
            <div className="age-group-picker" ref={ageGroupDropdownRef}>
              <button
                type="button"
                className="age-group-toggle"
                onClick={() => setIsAgeGroupOpen((prev) => !prev)}
              >
                {selectedAgeGroupLabels.length ? selectedAgeGroupLabels.join(", ") : "Select age groups"}
                <span>▾</span>
              </button>

              {isAgeGroupOpen && (
                <div className="age-group-menu">
                  {allowedAgeGroups.map((option) => (
                    <label key={option.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="agegroup_ids"
                        value={option.id}
                        checked={form.agegroup_ids.includes(option.id)}
                        onChange={handleChange}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* GENDER PICKER */}
            <div className="age-group-picker" ref={genderDropdownRef}>
              <button
                type="button"
                className="age-group-toggle"
                onClick={() => setIsGenderOpen((prev) => !prev)}
              >
                {selectedGenderLabels.length ? selectedGenderLabels.join(", ") : "Select genders"}
                <span>▾</span>
              </button>

              {isGenderOpen && (
                <div className="age-group-menu">
                  {genderOptions.map((option) => (
                    <label key={option.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="gender_id"
                        value={option.id}
                        checked={form.gender_id.includes(option.id)}
                        onChange={handleChange}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Event"}
            </Button>
          </form>
        )}

        {/* SEARCH BOX */}
        <div className="search-box">
          <select
            value={searchMeet}
            onChange={(e) => {
              setSearchMeet(e.target.value);
              setAssignedEvents([]);
              setError("");
            }}
          >
            <option value="">Select Meet</option>
            {meets.map((meet) => (
              <option key={meet.meet_id} value={meet.meet_name}>
                {meet.meet_name} ({meet.year})
              </option>
            ))}
          </select>

          <Button
            type="button"
            onClick={searchAssignedMeet}
            disabled={loading || !searchMeet}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* DATA TABLE */}
        <table className="event-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Type</th>
              <th>Age Groups</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {assignedEvents.length > 0 ? (
              assignedEvents.map((event, index) => (
                <tr key={index}>
                  <td>{event.event_name}</td>
                  <td>{event.event_type}</td>
                  <td>{event.age_groups}</td>
                  <td>{event.gender}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  {searchMeet
                    ? `No events have been assigned to ${searchMeet}`
                    : "Select a meet to view assigned events"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AssignEventsToMeet;