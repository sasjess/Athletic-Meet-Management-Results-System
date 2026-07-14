import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch, getAuthHeaders } from "../services/api";
import "./Schools.css";

const Schools = () => {
  const API_BASE =
    "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const [schools, setSchools] = useState([]);
  const [genders, setGenders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const headers = getAuthHeaders();

  const [form, setForm] = useState({
    school_name: "",
    province: "",
    district: "",
    city: "",
    gender_id: "",
  });

  // ============================
  // FETCH SCHOOLS
  // ============================
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${API_BASE}/schools/get_all_schools.php`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setSchools(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // ============================
  // FETCH GENDERS (CORRECTED)
  // ============================
  const fetchGenders = async () => {
    const url = `${API_BASE}/genders/read.php`;

    console.log("GENDER URL:", url);

    try {
      const response = await authFetch(url, {
        method: "GET",
        headers,
      });

      const data = await response.json();
      console.log("GENDER DATA RECEIVED:", data);

      // Safe check: handle both { status: "success", data: [...] } OR directly passing [...]
      if (Array.isArray(data)) {
        setGenders(data);
      } else if (data && Array.isArray(data.data)) {
        setGenders(data.data);
      } else if (data && data.status === "success" && Array.isArray(data.data)) {
        setGenders(data.data);
      } else {
        console.warn("Unexpected gender API response structure:", data);
        setGenders([]);
      }
    } catch (error) {
      console.error("GENDER FETCH ERROR:", error);
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchGenders();
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
  // RESET
  // ============================
  const resetForm = () => {
    setForm({
      school_name: "",
      province: "",
      district: "",
      city: "",
      gender_id: "",
    });
    setEditingId(null);
  };

  // ============================
  // CREATE / UPDATE
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const url = editingId
      ? `${API_BASE}/schools/update.php`
      : `${API_BASE}/schools/create.php`;

    const payload = editingId
      ? {
          school_id: Number(editingId),
          ...form,
        }
      : form;

    try {
      const response = await authFetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(data.message);
        resetForm();
        fetchSchools();
      } else {
        if (data.errors) {
          setError(data.errors.join(", "));
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================
  // EDIT
  // ============================
  const handleEdit = (school) => {
    setForm({
      school_name: school.school_name || "",
      province: school.province || "",
      district: school.district || "",
      city: school.city || "",
      gender_id: school.gender_id || "",
    });

    setEditingId(school.school_id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================
  // DELETE
  // ============================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;

    try {
      const response = await authFetch(`${API_BASE}/schools/delete.php`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school_id: id,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessage(data.message);
        fetchSchools();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================
  // SEARCH
  // ============================
  const filteredSchools = schools.filter((school) => {
    const q = searchQuery.toLowerCase();
    return (
      school.school_name?.toLowerCase().includes(q) ||
      school.province?.toLowerCase().includes(q) ||
      school.district?.toLowerCase().includes(q) ||
      school.city?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="schools-page">
        <div className="header">
          <h1>Schools Management</h1>
          <p>Manage participating school registrations</p>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form className="school-form" onSubmit={handleSubmit}>
          <input
            name="school_name"
            placeholder="School Name"
            value={form.school_name}
            onChange={handleChange}
          />

          <input
            name="province"
            placeholder="Province"
            value={form.province}
            onChange={handleChange}
          />

          <input
            name="district"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
          />

          <select
            name="gender_id"
            value={form.gender_id}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            {genders.map((g) => {
              // Extract gender properties safely (supports 'name', 'gender_name', or 'gender')
              const genderName = g.name || g.gender_name || g.gender || "Unknown";
              const genderId = g.gender_id || g.id;

              return (
                <option key={genderId} value={genderId}>
                  {genderName}
                </option>
              );
            })}
          </select>

          <Button type="submit">
            {editingId ? "Update School" : "+ Add School"}
          </Button>

          {editingId && (
            <Button type="button" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </form>

        <div className="search-container">
          <input
            className="search-input"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-box">
          <table className="school-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Province</th>
                <th>District</th>
                <th>City</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.school_id}>
                    <td>{school.school_id}</td>
                    <td>{school.school_name}</td>
                    <td>{school.province}</td>
                    <td>{school.district}</td>
                    <td>{school.city || "-"}</td>
                    <td>{school.name || school.gender_id}</td>
                    <td>
                      <button
                        className="edit"
                        onClick={() => handleEdit(school)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDelete(school.school_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Schools;