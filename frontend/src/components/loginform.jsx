import { useState } from "react";
import "./loginform.css";

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", password: "", confirm: "" });

  const handleLogin = () => {
    console.log("Login:", loginData);
    // navigate to dashboard after login
  };

  const handleSignup = () => {
    if (signupData.password !== signupData.confirm) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup:", signupData);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <div className="auth-form">
            <h2 className="form-title">Login Form</h2>
            <input
              type="username"
              className="auth-input"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <div className="forgot-link">
              <a href="#">Forgot password?</a>
            </div>
            <button className="auth-btn" onClick={handleLogin}>
              Login
            </button>
            <p className="switch-text">
              Not a member?{" "}
              <span className="link" onClick={() => setActiveTab("signup")}>
                Signup now
              </span>
            </p>
          </div>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <div className="auth-form">
            <h2 className="form-title">Signup Form</h2>
            <input
              type="username"
              className="auth-input"
              placeholder="username"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Confirm password"
              value={signupData.confirm}
              onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })}
            />
            <button className="auth-btn" onClick={handleSignup}>
              Signup
            </button>
            <p className="switch-text">
              Already a member?{" "}
              <span className="link" onClick={() => setActiveTab("login")}>
                Login now
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;