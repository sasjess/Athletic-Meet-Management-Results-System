import { useState } from "react";

const CreateResult = () => {
  const [formData, setFormData] = useState({
    athlete_id: "",
    event_id: "",
    meet_id: "",
    agegroup_id: "",
    gender_id: "",
    position: "",
    performance: "",
    points: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { value: "1", label: "Male" },
    { value: "2", label: "Female" },
  ];

  const ageGroupOptions = [
    { value: "1", label: "Under 12" },
    { value: "2", label: "Under 14" },
    { value: "3", label: "Under 16" },
    { value: "4", label: "Under 18" },
    { value: "5", label: "Under 20" },
    { value: "6", label: "Open" },
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.athlete_id) newErrors.athlete_id = "Athlete ID is required";
    if (!formData.event_id) newErrors.event_id = "Event is required";
    if (!formData.meet_id) newErrors.meet_id = "Meet is required";
    if (!formData.agegroup_id) newErrors.agegroup_id = "Age group is required";
    if (!formData.gender_id) newErrors.gender_id = "Gender is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.performance) newErrors.performance = "Performance is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      athlete_id: "",
      event_id: "",
      meet_id: "",
      agegroup_id: "",
      gender_id: "",
      position: "",
      performance: "",
      points: "",
      notes: "",
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div style={styles.page}>
      {/* Decorative background */}
      <div style={styles.bgAccent1} />
      <div style={styles.bgAccent2} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.badge}>ATHLETICS</div>
            <h1 style={styles.title}>Record Result</h1>
            <p style={styles.subtitle}>Enter competition performance data</p>
          </div>
          <div style={styles.headerIcon}>🏅</div>
        </div>

        {/* Success State */}
        {submitted ? (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Result Recorded</h2>
            <p style={styles.successText}>
              The result has been successfully saved to the system.
            </p>
            <div style={styles.successDetails}>
              {Object.entries(formData)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} style={styles.successRow}>
                    <span style={styles.successLabel}>
                      {k.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span style={styles.successValue}>{v}</span>
                  </div>
                ))}
            </div>
            <button onClick={handleReset} style={styles.btnOutline}>
              Record Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Section: Athlete */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>
                <span style={styles.sectionDot} />
                Athlete
              </div>
              <div style={styles.row}>
                <Field
                  label="Athlete ID"
                  name="athlete_id"
                  value={formData.athlete_id}
                  onChange={handleChange}
                  error={errors.athlete_id}
                  placeholder="e.g. ATH-001"
                />
              </div>
            </div>

            {/* Section: Event Info */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>
                <span style={styles.sectionDot} />
                Event Information
              </div>
              <div style={styles.row}>
                <Field
                  label="Event ID"
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleChange}
                  error={errors.event_id}
                  placeholder="e.g. EVT-100"
                />
                <Field
                  label="Meet ID"
                  name="meet_id"
                  value={formData.meet_id}
                  onChange={handleChange}
                  error={errors.meet_id}
                  placeholder="e.g. MEET-2024"
                />
              </div>
              <div style={styles.row}>
                <SelectField
                  label="Age Group"
                  name="agegroup_id"
                  value={formData.agegroup_id}
                  onChange={handleChange}
                  error={errors.agegroup_id}
                  options={ageGroupOptions}
                  placeholder="Select age group"
                />
                <SelectField
                  label="Gender"
                  name="gender_id"
                  value={formData.gender_id}
                  onChange={handleChange}
                  error={errors.gender_id}
                  options={genderOptions}
                  placeholder="Select gender"
                />
              </div>
            </div>

            {/* Section: Performance */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>
                <span style={styles.sectionDot} />
                Performance
              </div>
              <div style={styles.row}>
                <Field
                  label="Position / Rank"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  error={errors.position}
                  placeholder="e.g. 1"
                  type="number"
                />
                <Field
                  label="Performance"
                  name="performance"
                  value={formData.performance}
                  onChange={handleChange}
                  error={errors.performance}
                  placeholder="e.g. 10.45s or 7.20m"
                />
              </div>
              <div style={styles.row}>
                <Field
                  label="Points (optional)"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  error={errors.points}
                  placeholder="e.g. 10"
                  type="number"
                />
                <div style={{ flex: 1 }} />
              </div>
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes..."
                    style={styles.textarea}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button type="button" onClick={handleReset} style={styles.btnOutline}>
                Reset
              </button>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                {loading ? (
                  <span style={styles.spinner}>⏳ Saving...</span>
                ) : (
                  "Save Result"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────────── */

const Field = ({ label, name, value, onChange, error, placeholder, type = "text" }) => (
  <div style={styles.fieldWrap}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
    />
    {error && <span style={styles.errorMsg}>{error}</span>}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options, placeholder }) => (
  <div style={styles.fieldWrap}>
    <label style={styles.label}>{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={{ ...styles.input, ...styles.select, ...(error ? styles.inputError : {}) }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {error && <span style={styles.errorMsg}>{error}</span>}
  </div>
);

/* ── Styles ─────────────────────────────────────────────────── */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0c0f1a",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 20px 60px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  bgAccent1: {
    position: "fixed",
    top: "-120px",
    right: "-120px",
    width: "480px",
    height: "480px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgAccent2: {
    position: "fixed",
    bottom: "-100px",
    left: "-100px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: "720px",
    zIndex: 1,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "32px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  badge: {
    display: "inline-block",
    background: "rgba(234,179,8,0.15)",
    color: "#eab308",
    border: "1px solid rgba(234,179,8,0.3)",
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "3px",
    padding: "3px 10px",
    width: "fit-content",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontFamily: "'Courier New', monospace",
  },
  headerIcon: {
    fontSize: "48px",
    lineHeight: 1,
    opacity: 0.8,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  },
  section: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "12px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "4px",
  },
  sectionDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#eab308",
    display: "inline-block",
  },
  row: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  fieldWrap: {
    flex: 1,
    minWidth: "200px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f1f5f9",
    fontSize: "15px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    cursor: "pointer",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "32px",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorMsg: {
    color: "#ef4444",
    fontSize: "11px",
    fontFamily: "'Courier New', monospace",
  },
  textarea: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f1f5f9",
    fontSize: "15px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
    color: "#0c0f1a",
    border: "none",
    borderRadius: "8px",
    padding: "12px 32px",
    fontSize: "14px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "1px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
    textTransform: "uppercase",
  },
  btnOutline: {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "border-color 0.2s, color 0.2s",
    textTransform: "uppercase",
  },
  spinner: {
    fontSize: "13px",
  },
  // Success state
  successCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(234,179,8,0.25)",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(234,179,8,0.15)",
    border: "2px solid #eab308",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#eab308",
    fontWeight: "bold",
    lineHeight: 1,
    paddingTop: "2px",
  },
  successTitle: {
    margin: 0,
    color: "#f1f5f9",
    fontSize: "24px",
    fontWeight: "700",
  },
  successText: {
    margin: 0,
    color: "#64748b",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
  },
  successDetails: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(0,0,0,0.3)",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  successRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  successLabel: {
    color: "#64748b",
    fontFamily: "'Courier New', monospace",
    fontSize: "11px",
    letterSpacing: "1px",
  },
  successValue: {
    color: "#f1f5f9",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
  },
};

export default CreateResult;
