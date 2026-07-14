import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button"; // Reusable Button component
import { authFetch, getAuthHeaders } from "../services/api";
import "./Athletes.css";

const Athletes = () => {
  const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const [athletes, setAthletes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  // New search input state
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    bib_no: "",
    name: "",
    school_id: "",
    gender_id: "",
    agegroup_id: "",
  });

  const headers = getAuthHeaders();

  // ============================
  // FETCH ALL DATA 
  // ============================
  const fetchAthletes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch(`${API_BASE}/athletes/get_all_athletes.php`, {
        method: "GET",
        headers,
      });
      const data = await response.json();
      if (data.status === "success") {
        setAthletes(data.data || []);
      } else {
        setError(data.message || "Failed to load athletes");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch Schools
      const schoolRes = await authFetch(`${API_BASE}/schools/get_all_schools.php`, { 
        method: "GET", 
        headers 
      });
      const schoolData = await schoolRes.json();
      if (schoolData.status === "success") setSchools(schoolData.data || []);

      // Fetch Age Groups
      const ageRes = await authFetch(`${API_BASE}/agegroups/get_all_agegroups.php`, { 
        method: "GET", 
        headers 
      });
      const ageData = await ageRes.json();
      if (ageData.status === "success") setAgeGroups(ageData.data || []);
    } catch (err) {
      console.error("Error fetching dropdown options:", err.message);
    }
  };

  useEffect(() => {
    fetchAthletes();
    fetchDropdownData();
  }, []);

  // ============================
  // INPUT CHANGE
  // ============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ============================
  // RESET FORM
  // ============================
  const resetForm = () => {
    setForm({
      bib_no: "",
      name: "",
      school_id: "",
      gender_id: "",
      agegroup_id: "",
    });
    setEditingId(null);
  };

  // ============================
  // CREATE + UPDATE ATHLETE
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const url = editingId
      ? `${API_BASE}/athletes/update.php`
      : `${API_BASE}/athletes/create.php`;

    const method = editingId ? "PUT" : "POST";

    const payload = {
      bib_no: Number(form.bib_no),
      name: form.name,
      school_id: Number(form.school_id),
      gender_id: form.gender_id,
      agegroup_id: Number(form.agegroup_id),
    };

    try {
      const response = await authFetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(data.message);
        resetForm();
        fetchAthletes();
      } else {
        if (data.errors) {
          setError(data.errors.join(", "));
        } else {
          setError(data.message || "Operation failed");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================
  // EDIT ATHLETE
  // ============================
  const handleEdit = (athlete) => {
    setForm({
      bib_no: athlete.bib_no,
      name: athlete.name,
      school_id: athlete.school_id || "",
      gender_id:
        athlete.gender === "Male"
          ? "M"
          : athlete.gender === "Female"
            ? "F"
            : athlete.gender_id || "",
      agegroup_id: athlete.agegroup_id || "",
    });
    setEditingId(athlete.bib_no);
  };

  // ============================
  // DELETE ATHLETE
  // ============================
  const handleDelete = async (bib_no) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this athlete?");
    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      const response = await authFetch(`${API_BASE}/athletes/delete_by_bibno.php`, {
        method: "POST",
        headers,
        body: JSON.stringify({ bib_no }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(data.message);
        fetchAthletes();
      } else {
        setError(data.message || "Delete failed");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================
  // CLIENT FILTER LOGIC
  // ============================
  const filteredAthletes = athletes.filter((athlete) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // If search is empty, show everything

    const matchBib = String(athlete.bib_no).toLowerCase().includes(query);
    const matchSchool = athlete.school_name ? athlete.school_name.toLowerCase().includes(query) : false;

    // Check Athlete Name
  const matchName = athlete.name 
    ? athlete.name.toLowerCase().includes(query) 
    : false;

    return matchBib || matchSchool || matchName;
  });

  return (
    <Layout>
      <div className="athletes-page">
        {/* HEADER */}
        <div className="header">
          <h1>Athletes Management</h1>
          <p>Manage athlete registrations</p>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && <div className="success-message">{message}</div>}

        {/* ERROR MESSAGE */}
        {error && <div className="error-message">{error}</div>}

        {/* FORM */}
        <form className="athlete-form" onSubmit={handleSubmit}>
          <input
            type="number"
            name="bib_no"
            value={form.bib_no}
            onChange={handleChange}
            placeholder="Bib Number"
            disabled={editingId !== null}
            required
          />

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Athlete Name"
            required
          />

          {/* SCHOOL DROPDOWN */}
          <select
            name="school_id"
            value={form.school_id}
            onChange={handleChange}
            required
          >
            <option value="">Select School Name</option>
            {schools.map((school) => (
              <option key={school.school_id} value={school.school_id}>
                {school.school_name}
              </option>
            ))}
          </select>

          {/* GENDER DROPDOWN */}
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

          {/* AGE GROUP DROPDOWN */}
          <select
            name="agegroup_id"
            value={form.agegroup_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Age Group</option>
            {ageGroups.map((group) => (
              <option key={group.agegroup_id} value={group.agegroup_id}>
                {group.group_name}
              </option>
            ))}
          </select>

          {/* REUSABLE BUTTON COMPONENT */}
          <Button className="btn-primary" type="submit">
            {editingId ? "Update Athlete" : "+ Add Athlete"}
          </Button>

          {editingId && (
            <Button className="btn-secondary" type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </Button>
          )}
        </form>

        <hr className="section-divider" />

        {/* SEARCH CONTROLS */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by Bib No,Name or School Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              Clear
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="table-box">
          <table className="athlete-table">
            <thead>
              <tr>
                <th>Bib No</th>
                <th>Athlete Name</th>
                <th>School</th>
                <th>Gender</th>
                <th>Age Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : filteredAthletes.length > 0 ? (
                filteredAthletes.map((athlete) => (
                  <tr key={athlete.bib_no}>
                    <td>{athlete.bib_no}</td>
                    <td>{athlete.name}</td>
                    <td>{athlete.school_name || "-"}</td>
                    <td>{athlete.gender || "-"}</td>
                    <td>{athlete.age_group || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="edit"
                        onClick={() => handleEdit(athlete)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete"
                        onClick={() => handleDelete(athlete.bib_no)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No athletes found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Athletes;