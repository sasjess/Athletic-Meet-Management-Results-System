
import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import "./CreateResult.css";

const CreateResult = () => {
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

    console.log(formData);

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

        <div className="create-header">
          <div>
            <h1 className="create-title">Create Result</h1>
            <p className="create-subtitle">
              Record athlete competition performance
            </p>
          </div>

          <button className="back-btn">
            Results List
          </button>
        </div>

        {submitted ? (
          <div className="success-card">
            <div className="success-icon">✓</div>

            <h2>Result Saved Successfully</h2>

            <p>
              Athlete result has been added to the system.
            </p>

            <button
              className="primary-btn"
              onClick={handleReset}
            >
              Add Another Result
            </button>
          </div>
        ) : (
          <form className="result-form" onSubmit={handleSubmit}>

            <div className="form-grid">

              <FormField
                label="Bib Number"
                name="bib_no"
                value={formData.bib_no}
                onChange={handleChange}
                error={errors.bib_no}
              />

              <FormField
                label="Event ID"
                name="event_id"
                value={formData.event_id}
                onChange={handleChange}
                error={errors.event_id}
              />

              <FormField
                label="Meet ID"
                name="meet_id"
                value={formData.meet_id}
                onChange={handleChange}
                error={errors.meet_id}
              />

              <FormField
                label="Age Group ID"
                name="agegroup_id"
                value={formData.agegroup_id}
                onChange={handleChange}
                error={errors.agegroup_id}
              />

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

                {errors.gender_id && (
                  <span className="error-text">
                    {errors.gender_id}
                  </span>
                )}
              </div>

              <FormField
                label="Stage ID"
                name="stage_id"
                value={formData.stage_id}
                onChange={handleChange}
                error={errors.stage_id}
              />

              <FormField
                label="Heat Number"
                name="heat_no"
                value={formData.heat_no}
                onChange={handleChange}
                error={errors.heat_no}
              />

              <FormField
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={errors.position}
              />

              <FormField
                label="Performance Time"
                name="performance_time"
                value={formData.performance_time}
                onChange={handleChange}
              />

              <FormField
                label="Performance Distance"
                name="performance_distance"
                value={formData.performance_distance}
                onChange={handleChange}
              />

              <FormField
                label="Points"
                name="points"
                value={formData.points}
                onChange={handleChange}
              />

            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleReset}
              >
                Reset
              </button>

              <button
                type="submit"
                className="primary-btn"
              >
                Save Result
              </button>
            </div>

          </form>
        )}
      </div>
    </Layout>
  );
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
}) => (
  <div className="input-group">
    <label>{label}</label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className={error ? "error-input" : ""}
    />

    {error && (
      <span className="error-text">
        {error}
      </span>
    )}
  </div>
);

export default CreateResult;
