import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import { authFetch } from "../services/api";
import "./Meets.css";

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

  try {
    const res = await authFetch(`${API}/create.php`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    console.log("CREATE RESPONSE:", data);


    if (data.status === "success") {

      alert("Meet added successfully!");

      setForm({
        year: "",
        meet_name: "",
        start_date: "",
        end_date: "",
        status: "Upcoming"
      });

      fetchMeets();

    } else {

      alert(data.message || "Failed to add meet");

    }


  } catch (error) {
    

  console.error("FULL ERROR:", error);
  alert(error.message);

}

    // console.error("CREATE ERROR:", error);
    // alert("Server error. Cannot add meet.");

  
};

  return (
  <Layout>

    <div className="meets-page">

      <h2>Meets</h2>

      <form className="meet-form" onSubmit={handleSubmit}>

        <input 
          name="year" 
          placeholder="Year" 
          onChange={handleChange} 
          value={form.year} 
        />

        <input 
          name="meet_name" 
          placeholder="Meet Name" 
          onChange={handleChange} 
          value={form.meet_name} 
        />

        <input 
          type="date" 
          name="start_date" 
          onChange={handleChange} 
          value={form.start_date} 
        />

        <input 
          type="date" 
          name="end_date" 
          onChange={handleChange} 
          value={form.end_date} 
        />


        <select 
          name="status" 
          onChange={handleChange} 
          value={form.status}
        >
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>


        <Button type="submit">
          Add Meet
        </Button>

      </form>



      <div className="meets-table-container">

        <table className="meets-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Year</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>


          <tbody>

            {meets.map((m)=>(
              <tr key={m.meet_id}>
                <td>{m.meet_id}</td>
                <td>{m.year}</td>
                <td>{m.meet_name}</td>
                <td className={`status-${m.status.toLowerCase()}`}>
                  {m.status}
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

export default Meets;