import { useState } from "react";
import "./loginform.css";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  
const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const res = await fetch("http://localhost/backend/auth/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const data = await res.json();

    if (data.success) {
      // store user + role + token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful");

      // go to dashboard
      navigate("/dashboard");

    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
  }
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
            
          </div>
        )}

        </div>
    </div>
  );
};

export default LoginForm;