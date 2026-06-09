import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import "./Athletes.css";

const Athletes = () => {
  const [athletes, setAthletes] = useState([
    {
      bib_no: 101,
      name: "Ashan Perera",
      school_id: 1,
      gender_id: "M",
      agegroup_id: 4,
    },
    {
      bib_no: 102,
      name: "Nimali Silva",
      school_id: 2,
      gender_id: "F",
      agegroup_id: 5,
    },
  ]);

  const [form, setForm] = useState({
    bib_no: "",
    name: "",
    school_id: "",
    gender_id: "",
    agegroup_id: "",
  });

  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE + UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      const updated = athletes.map((a) =>
        a.bib_no === editingId ? { ...a, ...form } : a
      );
      setAthletes(updated);
      setEditingId(null);
    } else {
      setAthletes([...athletes, form]);
    }

    setForm({
      bib_no: "",
      name: "",
      school_id: "",
      gender_id: "",
      agegroup_id: "",
    });
  };

  // DELETE
  const handleDelete = (id) => {
    setAthletes(athletes.filter((a) => a.bib_no !== id));
  };

  // EDIT
  const handleEdit = (athlete) => {
    setForm(athlete);
    setEditingId(athlete.bib_no);
  };

  return (
    <Layout>
      <div className="athletes-page">

        {/* HEADER */}
        <div className="header">
          <h1>Athletes Management</h1>
          <p>Manage athlete registrations</p>
        </div>

        {/* FORM */}
        <form className="athlete-form" onSubmit={handleSubmit}>

          <input
            name="bib_no"
            value={form.bib_no}
            onChange={handleChange}
            placeholder="Bib Number"
            required
          />

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Athlete Name"
            required
          />

          <input
            name="school_id"
            value={form.school_id}
            onChange={handleChange}
            placeholder="School ID"
            required
          />

          <select
            name="gender_id"
            value={form.gender_id}
            onChange={handleChange}
            required
          >
            <option value="">Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>

          <input
            name="agegroup_id"
            value={form.agegroup_id}
            onChange={handleChange}
            placeholder="Age Group ID"
            required
          />

          <button className="btn-primary">
            {editingId ? "Update Athlete" : "+ Add Athlete"}
          </button>

        </form>

        {/* TABLE */}
        <div className="table-box">

          <table className="athlete-table">

            <thead>
              <tr>
                <th>Bib No</th>
                <th>Name</th>
                <th>School</th>
                <th>Gender</th>
                <th>Age Group</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {athletes.map((a) => (
                <tr key={a.bib_no}>

                  <td>{a.bib_no}</td>
                  <td>{a.name}</td>
                  <td>{a.school_id}</td>
                  <td>{a.gender_id}</td>
                  <td>{a.agegroup_id}</td>

                  <td>
                    <button
                      className="edit"
                      onClick={() => handleEdit(a)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete"
                      onClick={() => handleDelete(a.bib_no)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </Layout>
  );
};

export default Athletes;
