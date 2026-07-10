import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { authFetch } from "../services/api";

const API = "http://localhost/Athletic-Meet-Management-Results-System/backend/events";

const Events = () => {
  const [events, setEvents] = useState([]);

  const [form, setForm] = useState({
    event_name: "",
    event_type: ""
  });

  const [loading, setLoading] = useState(false);

  // GET EVENTS
  const fetchEvents = async () => {
    try {
      const res = await authFetch(`${API}/list.php`);
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.log("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents()
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // SUBMIT (CREATE EVENT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authFetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const result = await res.json();

      console.log(result);

      setForm({ event_name: "", event_type: "" });
      fetchEvents();

    } catch (error) {
      console.log("Error creating event:", error);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <h2>Events Management</h2>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Event"}
          </button>
        </form>

        {/* TABLE */}
        <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event Name</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {events.length > 0 ? (
              events.map((e) => (
                <tr key={e.event_id}>
                  <td>{e.event_id}</td>
                  <td>{e.event_name}</td>
                  <td>{e.event_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Events;