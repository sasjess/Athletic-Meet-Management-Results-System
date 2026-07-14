import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch } from "../services/api";
import "./Events.css";

const API =
  "http://localhost/Athletic-Meet-Management-Results-System/backend/events";

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
  ageGroupOptions.map(({ id, label }) => [id, label])
);

const genderLabels = Object.fromEntries(
  genderOptions.map(({ id, label }) => [id, label])
);

const normalizeEvent = (event) => {
  const agegroupIds = Array.isArray(event.agegroup_ids)
    ? event.agegroup_ids
    : typeof event.agegroup_ids === "string" && event.agegroup_ids
    ? event.agegroup_ids.split(",").map((value) => value.trim()).filter(Boolean)
    : event.agegroup_id
    ? [String(event.agegroup_id)]
    : [];

  const genderIds = Array.isArray(event.gender_id)
    ? event.gender_id
    : typeof event.gender_id === "string" && event.gender_id
    ? event.gender_id.split(",").map((value) => value.trim()).filter(Boolean)
    : event.gender_id
    ? [String(event.gender_id)]
    : [];

  const ageGroupLabelsForEvent = agegroupIds.map(
    (id) => ageGroupLabels[id] || "Unknown"
  );

  const genderLabelsForEvent = genderIds.map(
    (id) => genderLabels[id] || "Unknown"
  );

  return {
    ...event,
    agegroup_ids: agegroupIds,
    age_group_labels: ageGroupLabelsForEvent,
    age_group_label: ageGroupLabelsForEvent[0] || "Unknown",
    gender_id: genderIds,
    gender_labels: genderLabelsForEvent,
    gender_label: genderLabelsForEvent[0] || "Unknown",
    event_id: event.event_id,
  };
};

const getEventAgeGroupLabels = (event) => {
  if (Array.isArray(event.agegroup_ids) && event.agegroup_ids.length > 0) {
    return event.agegroup_ids.map((id) => ageGroupLabels[id] || "Unknown");
  }

  if (Array.isArray(event.age_group_labels) && event.age_group_labels.length > 0) {
    return event.age_group_labels;
  }

  return event.age_group_label && event.age_group_label !== "Unknown"
    ? [event.age_group_label]
    : [];
};

const getEventGenderLabels = (event) => {
  if (Array.isArray(event.gender_id) && event.gender_id.length > 0) {
    return event.gender_id.map((id) => genderLabels[id] || "Unknown");
  }

  if (Array.isArray(event.gender_labels) && event.gender_labels.length > 0) {
    return event.gender_labels;
  }

  return event.gender_label && event.gender_label !== "Unknown"
    ? [event.gender_label]
    : [];
};

const Events = () => {
  const [events, setEvents] = useState([]);

  const [form, setForm] = useState({
    event_name: "",
    event_type: "",
    gender_id: [],
    agegroup_id: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isAgeGroupOpen, setIsAgeGroupOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const ageGroupDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);

  const fetchEvents = async () => {
    try {
      const res = await authFetch(`${API}/list.php`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setEvents(data.map(normalizeEvent));
      } else if (data && data.status === "success") {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isAgeGroupOpen &&
        ageGroupDropdownRef.current &&
        !ageGroupDropdownRef.current.contains(event.target)
      ) {
        setIsAgeGroupOpen(false);
      }

      if (
        isGenderOpen &&
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target)
      ) {
        setIsGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAgeGroupOpen, isGenderOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => {
        const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
        const nextValues = checked
          ? [...currentValues, value]
          : currentValues.filter((item) => item !== value);

        return {
          ...prev,
          [name]: nextValues,
        };
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const agegroupIds = Array.isArray(form.agegroup_id)
      ? form.agegroup_id
      : [form.agegroup_id].filter(Boolean);

    const genderIds = Array.isArray(form.gender_id)
      ? form.gender_id
      : [form.gender_id].filter(Boolean);

    if (agegroupIds.length === 0) {
      setError("Please select at least one age group");
      return;
    }

    if (genderIds.length === 0) {
      setError("Please select at least one gender");
      return;
    }

    // 🧠 1. NORMALIZE USER INPUT STRING FOR VALIDATION
    // This turns "100 m", "100m", and "  100  M  " all into "100m"
    const incomingNormalized = form.event_name.toLowerCase().replace(/\s+/g, "");

    // 🧠 2. CHECK AGAINST CURRENTLY LOADED EVENTS FOR DUPLICATES
    const isDuplicate = events.some((evt) => {
      if (!evt.event_name) return false;
      
      const existingNormalized = evt.event_name.toLowerCase().replace(/\s+/g, "");
      
      // If the standardized name matches, check if it shares overlapping age groups and genders
      const sharedAgeGroup = evt.agegroup_ids?.some(id => agegroupIds.includes(String(id)));
      const sharedGender = evt.gender_id?.some(id => genderIds.includes(String(id)));

      return incomingNormalized === existingNormalized && sharedAgeGroup && sharedGender;
    });

    if (isDuplicate) {
      setError(`An event matching "${form.event_name.trim()}" already exists for these selected categories!`);
      return;
    }

    // 🧠 3. PRETTIFY EVENT NAME BEFORE SAVING
    // Ensures if they type "100m" or "100   m" it standardizes uniformly as "100 m"
    let standardizedName = form.event_name.trim();
    if (/^\d+m$/i.test(incomingNormalized)) {
      // Matches formats like 100m, 200m -> converts to "100 m", "200 m"
      const distance = incomingNormalized.match(/\d+/)[0];
      standardizedName = `${distance} m`;
    }

    const payload = {
      event_name: standardizedName,
      event_type: form.event_type,
      gender_id: genderIds,
      agegroup_id: agegroupIds,
    };

    try {
      setLoading(true);
      const response = await authFetch(`${API}/create.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(data.message);

        setForm({
          event_name: "",
          event_type: "",
          gender_id: [],
          agegroup_id: [],
        });

        fetchEvents();
      } else if (data.errors) {
        setError(data.errors.join(", "));
      } else {
        setError(data.message || "Failed to create event");
      }
    } catch (err) {
      console.error("CREATE EVENT ERROR:", err);
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const selectedAgeGroupLabels = form.agegroup_id
    .map((id) => ageGroupLabels[id])
    .filter(Boolean);

  const selectedGenderLabels = form.gender_id
    .map((id) => genderLabels[id])
    .filter(Boolean);

  const groupedEvents = events.reduce((groups, event) => {
    const ageGroups = getEventAgeGroupLabels(event);
    const genderGroups = getEventGenderLabels(event);

    ageGroups.forEach((age) => {
      genderGroups.forEach((gender) => {
        if (!groups[age]) {
          groups[age] = {};
        }

        if (!groups[age][gender]) {
          groups[age][gender] = [];
        }

        groups[age][gender].push(event);
      });
    });

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
            <option value="Relay">Relay</option>
          </select>

          <div className="age-group-picker" ref={ageGroupDropdownRef}>
            <button
              type="button"
              className="age-group-toggle"
              onClick={() => setIsAgeGroupOpen((prev) => !prev)}
            >
              <span>
                {selectedAgeGroupLabels.length > 0
                  ? selectedAgeGroupLabels.join(", ")
                  : "Select age groups"}
              </span>
              <span className="age-group-toggle-icon">▾</span>
            </button>

            {isAgeGroupOpen && (
              <div className="age-group-menu" role="menu">
                {ageGroupOptions.map((option) => {
                  const isChecked = form.agegroup_id.includes(option.id);

                  return (
                    <label key={option.id} className="checkbox-item" role="menuitem">
                      <input
                        type="checkbox"
                        name="agegroup_id"
                        value={option.id}
                        checked={isChecked}
                        onChange={handleChange}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="age-group-picker" ref={genderDropdownRef}>
            <button
              type="button"
              className="age-group-toggle"
              onClick={() => setIsGenderOpen((prev) => !prev)}
            >
              <span>
                {selectedGenderLabels.length > 0
                  ? selectedGenderLabels.join(", ")
                  : "Select genders"}
              </span>
              <span className="age-group-toggle-icon">▾</span>
            </button>

            {isGenderOpen && (
              <div className="age-group-menu" role="menu">
                {genderOptions.map((option) => {
                  const isChecked = form.gender_id.includes(option.id);

                  return (
                    <label key={option.id} className="checkbox-item" role="menuitem">
                      <input
                        type="checkbox"
                        name="gender_id"
                        value={option.id}
                        checked={isChecked}
                        onChange={handleChange}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={loading}
            className="add-event-btn"
          >
            {loading ? "Saving..." : "+ Add Event"}
          </Button>
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
