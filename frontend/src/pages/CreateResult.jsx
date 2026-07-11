import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import "./CreateResult.css";

const CreateResult = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bib_no: "",
    event_id: "",
    meet_id: "",
    agegroup_id: "",
    gender_id: "",
    performance_time: "",
    performance_distance: "",
    stage_id: "",
    heat_no: "",
    position: "",
    points: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.bib_no) newErrors.bib_no = "Bib number is required";
    if (!formData.event_id) newErrors.event_id = "Event ID is required";
    if (!formData.meet_id) newErrors.meet_id = "Meet ID is required";
    if (!formData.agegroup_id) newErrors.agegroup_id = "Age group is required";
    if (!formData.gender_id) newErrors.gender_id = "Gender is required";
    if (!formData.stage_id) newErrors.stage_id = "Stage ID is required";
    if (!formData.heat_no) newErrors.heat_no = "Heat number is required";
    if (!formData.position) newErrors.position = "Position is required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Submitted Result:", formData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      bib_no: "",
      event_id: "",
      meet_id: "",
      agegroup_id: "",
      gender_id: "",
      performance_time: "",
      performance_distance: "",
      stage_id: "",
      heat_no: "",
      position: "",
      points: "",
    });

    setErrors({});
    setSubmitted(false);
  };

  return (
    <Layout>
      <div className="create-result-page">

        {/* HEADER */}
        <div className="create-header">
          <div>
            <h1 className="create-title">Create Result</h1>
            <p className="create-subtitle">
              Record athlete competition performance
            </p>
          </div>

          <Button variant="secondary" onClick={() => navigate("/results")}>Results List</Button>
        </div>

        {/* SUCCESS STATE */}
        {submitted ? (
          <div className="success-card">
            <div className="success-icon">✓</div>

            <h2>Result Saved Successfully</h2>
            <p>Athlete result has been added to the system.</p>

            <Button onClick={handleReset}>Add Another Result</Button>
          </div>
        ) : (
          /* FORM */
          <form className="result-form" onSubmit={handleSubmit}>
            <div className="form-grid">

              <FormField label="Bib Number" name="bib_no" value={formData.bib_no} onChange={handleChange} error={errors.bib_no} type="number" />
              <FormField label="Event ID" name="event_id" value={formData.event_id} onChange={handleChange} error={errors.event_id} type="number" />
              <FormField label="Meet ID" name="meet_id" value={formData.meet_id} onChange={handleChange} error={errors.meet_id} type="number" />
              <FormField label="Age Group ID" name="agegroup_id" value={formData.agegroup_id} onChange={handleChange} error={errors.agegroup_id} type="number" />

              <div className="input-group">
                <label>Gender</label>
                <select
                  name="gender_id"
                  value={formData.gender_id}
                  onChange={handleChange}
                  className={errors.gender_id ? "error-input" : ""}
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                {errors.gender_id && <span className="error-text">{errors.gender_id}</span>}
              </div>

              <FormField label="Stage ID" name="stage_id" value={formData.stage_id} onChange={handleChange} error={errors.stage_id} type="number" />
              <FormField label="Heat Number" name="heat_no" value={formData.heat_no} onChange={handleChange} error={errors.heat_no} type="number" />
              <FormField label="Position" name="position" value={formData.position} onChange={handleChange} error={errors.position} type="number" />

              <FormField label="Performance Time" name="performance_time" value={formData.performance_time} onChange={handleChange} type="text" />
              <FormField label="Performance Distance" name="performance_distance" value={formData.performance_distance} onChange={handleChange} type="text" />
              <FormField label="Points" name="points" value={formData.points} onChange={handleChange} type="number" />

            </div>

            {/* ACTIONS */}
            <div className="form-actions">
                <Button type="button" variant="secondary" onClick={handleReset}>
                Reset
              </Button>

              <Button type="submit">Save Result</Button>
            </div>

          </form>
        )}
      </div>
    </Layout>
  );
};

/* Reusable Input Component */
const FormField = ({ label, name, value, onChange, error, type = "text" }) => (
  <div className="input-group">
    <label>{label}</label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={error ? "error-input" : ""}
    />

    {error && <span className="error-text">{error}</span>}
  </div>
);

export default CreateResult;