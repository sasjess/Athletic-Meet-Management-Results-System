import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

const API = "http://localhost/backend/schools";

const Schools = () => {
  const [schools, setSchools] = useState([]);

  const [form, setForm] = useState({
    school_name: "",
    province: "",
    district: "",
    city: ""
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    const res = await fetch(`${API}/read.php`);
    setSchools(await res.json());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${API}/create.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({ school_name: "", province: "", district: "", city: "" });
    fetchSchools();
  };

  return (
    <Layout>
      <h2>Schools</h2>

      <form onSubmit={handleSubmit}>
        <input name="school_name" placeholder="School Name" onChange={handleChange} value={form.school_name} />
        <input name="province" placeholder="Province" onChange={handleChange} value={form.province} />
        <input name="district" placeholder="District" onChange={handleChange} value={form.district} />
        <input name="city" placeholder="City" onChange={handleChange} value={form.city} />

        <button>Add School</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Province</th>
            <th>District</th>
            <th>City</th>
          </tr>
        </thead>

        <tbody>
          {schools.map((s) => (
            <tr key={s.school_id}>
              <td>{s.school_id}</td>
              <td>{s.school_name}</td>
              <td>{s.province}</td>
              <td>{s.district}</td>
              <td>{s.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Schools;