import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch } from "../services/api";

const API = "http://localhost/Athletic-Meet-Management-Results-System/backend/meets";

const Meets = () => {
  const [meets, setMeets] = useState([]);

  const [form, setForm] = useState({
    year: "",
    meet_name: "",
    start_date: "",
    end_date: "",
    status: "Upcoming"
  });

  useEffect(() => {
    fetchMeets();
  }, []);

  const fetchMeets = async () => {
    const res = await authFetch(`${API}/read.php`);
    setMeets(await res.json());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await authFetch(`${API}/create.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({
      year: "",
      meet_name: "",
      start_date: "",
      end_date: "",
      status: "Upcoming"
    });

    fetchMeets();
  };

  return (
    <Layout>
      <h2>Meets</h2>

      <form onSubmit={handleSubmit}>
        <input name="year" placeholder="Year" onChange={handleChange} value={form.year} />
        <input name="meet_name" placeholder="Meet Name" onChange={handleChange} value={form.meet_name} />
        <input type="date" name="start_date" onChange={handleChange} value={form.start_date} />
        <input type="date" name="end_date" onChange={handleChange} value={form.end_date} />

        <select name="status" onChange={handleChange} value={form.status}>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>

        <Button type="submit">Add Meet</Button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Year</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {meets.map((m) => (
            <tr key={m.meet_id}>
              <td>{m.meet_id}</td>
              <td>{m.year}</td>
              <td>{m.meet_name}</td>
              <td>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Meets;