
import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch } from "../services/api";
import "./Events.css";

const API =
  "http://localhost/Athletic-Meet-Management-Results-System/backend/events";

const ageGroupLabels = {
  1: "Under 12",
  3: "Under 14",
  17: "Under 16",
  18: "Under 18",
  19: "Under 20",
};

const genderLabels = {
  M: "Male",
  F: "Female",
  1: "Male",
  2: "Female",
};


const normalizeEvent = (event) => {
  return {
    ...event,

    age_group_label:
      ageGroupLabels[event.agegroup_id] || "Unknown",

    gender_label:
      genderLabels[event.gender_id] || "Unknown",

    event_id: event.event_id
  };
};

const Events = () => {
  const [events, setEvents] = useState([]);

  const [form, setForm] = useState({
    event_name: "",
    event_type: "",
    gender_id: "",
    agegroup_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await authFetch(`${API}/list.php`);
      const data = await res.json();
      console.log("EVENT API RESPONSE:", data);

      if (Array.isArray(data)) {
        setEvents(data.map(normalizeEvent));
      } else if (data.status === "success") {
        setEvents((data.data || []).map(normalizeEvent));
      } else {
        setEvents([]);
        setError(data.message || "No events found");
      }
    } catch (err) {
      console.error(err);
      setEvents([]);
      setError("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  
  const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");
  setError("");

  const payload = {
    event_name: form.event_name,
    event_type: form.event_type,
    gender_id: form.gender_id,
    agegroup_id: Number(form.agegroup_id),
  };

  try {
    const response = await authFetch(
      `${API}/create.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("CREATE EVENT RESPONSE:", data);

    if (data.status === "success") {

      setMessage(data.message);

      setForm({
        event_name: "",
        event_type: "",
        gender_id: "",
        agegroup_id: "",
      });

      fetchEvents();

    } else {

      if (data.errors) {
        setError(data.errors.join(", "));
      } else {
        setError(data.message || "Failed to create event");
      }

    }

  } catch (err) {

    console.error("CREATE EVENT ERROR:", err);

    setError(err.message);

  }
};

  const groupedEvents = events.reduce((groups, event) => {
    const age = event.age_group_label;
    const gender = event.gender_label;

    if (!groups[age]) {
      groups[age] = {};
    }

    if (!groups[age][gender]) {
      groups[age][gender] = [];
    }

    groups[age][gender].push(event);

    return groups;
  }, {});

  const ageOrder = {
    "Under 12": 1,
    "Under 14": 2,
    "Under 16": 3,
    "Under 18": 4,
    "Under 20": 5,
  };

  const sortedAgeGroups = Object.keys(groupedEvents)
    .filter((ageGroup) => ageGroup !== "Unknown")
    .sort((a, b) => (ageOrder[a] || 99) - (ageOrder[b] || 99));

  return (
    <Layout>
      <div className="events-page">
        <h1>Events Management</h1>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form className="event-form" onSubmit={handleSubmit}>
          <input
            name="event_name"
            placeholder="Event Name"
            value={form.event_name}
            onChange={handleChange}
            required
          />

          <select
            name="event_type"
            value={form.event_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Track">Track</option>
            <option value="Field">Field</option>
          </select>

          <select
            name="agegroup_id"
            value={form.agegroup_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Age Group</option>
            <option value="1">Under 12</option>
            <option value="3">Under 14</option>
            <option value="17">Under 16</option>
            <option value="18">Under 18</option>
            <option value="19">Under 20</option>
          </select>

          <select
            name="gender_id"
            value={form.gender_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={loading}
            className="add-event-btn"
          >
            {loading ? "Saving..." : "+ Add Event"}
          </Button>

          {/* <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "+ Add Event"}
          </Button> */}
        </form>

        <div className="events-list">
          {sortedAgeGroups.length > 0 ? (
            sortedAgeGroups.map((ageGroup) => (
              <div className="age-section" key={ageGroup}>
                <h2 className="age-title">{ageGroup.toUpperCase()}</h2>
                <div className="age-separator" />

                {["Male", "Female"].map((gender) => {
                  const eventsForGender = groupedEvents[ageGroup][gender];
                  if (!eventsForGender || eventsForGender.length === 0) {
                    return null;
                  }

                  return (
                    <div className="gender-section" key={gender}>
                      <h3 className="gender-title">{gender}</h3>
                      <table className="event-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Event Name</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventsForGender.map((event) => (
                            <tr key={event.event_id || event.id}>
                              <td>{event.event_id || event.id}</td>
                              <td>{event.event_name}</td>
                              <td>{event.event_type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="no-events">No events found.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Events;
