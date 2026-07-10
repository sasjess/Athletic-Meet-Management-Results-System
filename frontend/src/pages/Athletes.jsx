import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { authFetch, getAuthHeaders } from "../services/api";
import "./Athletes.css";

const Athletes = () => {

  const API_BASE =
    "http://localhost/Athletic-Meet-Management-Results-System/backend";

  const [athletes, setAthletes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);


  const [form, setForm] = useState({
    bib_no: "",
    name: "",
    school_id: "",
    gender_id: "",
    agegroup_id: "",
  });


  const headers = getAuthHeaders();



  // ============================
  // FETCH ALL ATHLETES
  // ============================

  const fetchAthletes = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await authFetch(
        `${API_BASE}/athletes/get_all_athletes.php`,
        {
          method: "GET",
          headers,
        }
      );


      const data = await response.json();


      if (data.status === "success") {

        setAthletes(data.data || []);

      } else {

        setError(
          data.message || "Failed to load athletes"
        );

      }


    } catch (err) {

      setError(err.message);

    }


    setLoading(false);

  };



  useEffect(() => {

    fetchAthletes();

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


  const method = editingId
    ? "PUT"
    : "POST";


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

        setError(
          data.errors.join(", ")
        );

      } else {

        setError(
          data.message || "Operation failed"
        );

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

    school_id: athlete.school_id,

    gender_id:
      athlete.gender === "Male"
        ? "M"
        : athlete.gender,

    agegroup_id:
      athlete.agegroup_id || "",

  });


  setEditingId(athlete.bib_no);


};




// ============================
// DELETE ATHLETE
// ============================

const handleDelete = async (bib_no) => {


  const confirmDelete = window.confirm(
    "Are you sure you want to delete this athlete?"
  );


  if (!confirmDelete) return;



  setMessage("");

  setError("");



  try {


    const response = await fetch(

      `${API_BASE}/athletes/delete_by_bibno.php`,

      {

        method: "POST",

        headers,

        body: JSON.stringify({

          bib_no

        }),

      }

    );



    const data = await response.json();



    if (data.status === "success") {


      setMessage(
        data.message
      );


      fetchAthletes();



    } else {


      setError(
        data.message || "Delete failed"
      );


    }



  } catch (err) {


    setError(err.message);


  }


};
  return (
    <Layout>

      <div className="athletes-page">


        {/* HEADER */}
        <div className="header">

          <h1>
            Athletes Management
          </h1>

          <p>
            Manage athlete registrations
          </p>

        </div>



        {/* SUCCESS MESSAGE */}
        {message && (

          <div className="success-message">

            {message}

          </div>

        )}



        {/* ERROR MESSAGE */}
        {error && (

          <div className="error-message">

            {error}

          </div>

        )}



        {/* FORM */}

        <form
          className="athlete-form"
          onSubmit={handleSubmit}
        >


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



          <input

            type="number"

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

            <option value="">
              Select Gender
            </option>


            <option value="M">
              Male
            </option>


            <option value="F">
              Female
            </option>


          </select>



          <input

            type="number"

            name="agegroup_id"

            value={form.agegroup_id}

            onChange={handleChange}

            placeholder="Age Group ID"

            required

          />



          <button
            className="btn-primary"
            type="submit"
          >

            {editingId
              ? "Update Athlete"
              : "+ Add Athlete"}

          </button>



          {editingId && (

            <button

              type="button"

              onClick={resetForm}

            >

              Cancel

            </button>

          )}


        </form>
                {/* TABLE */}

        <div className="table-box">

          <table className="athlete-table">

            <thead>

              <tr>

                <th>
                  Bib No
                </th>

                <th>
                  Athlete Name
                </th>

                <th>
                  School
                </th>

                <th>
                  Gender
                </th>

                <th>
                  Age Group
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>



            <tbody>


              {loading ? (

                <tr>

                  <td colSpan="6">

                    Loading...

                  </td>

                </tr>


              ) : athletes.length > 0 ? (


                athletes.map((athlete) => (

                  <tr key={athlete.bib_no}>


                    <td>
                      {athlete.bib_no}
                    </td>



                    <td>
                      {athlete.name}
                    </td>



                    <td>
                      {athlete.school_name || "-"}
                    </td>



                    <td>
                      {athlete.gender || "-"}
                    </td>



                    <td>
                      {athlete.age_group || "-"}
                    </td>



                    <td>


                      <button

                        type="button"

                        className="edit"

                        onClick={() =>
                          handleEdit(athlete)
                        }

                      >

                        Edit

                      </button>



                      <button

                        type="button"

                        className="delete"

                        onClick={() =>
                          handleDelete(
                            athlete.bib_no
                          )
                        }

                      >

                        Delete

                      </button>


                    </td>


                  </tr>

                ))


              ) : (


                <tr>

                  <td colSpan="6">

                    No athletes available.

                  </td>

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