import { useState, useEffect } from "react";
import "./loginform.css";
import loginImage from "../assets/login.jpeg";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError("");
    setMessage("");

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost/Athletic-Meet-Management-Results-System/backend/auth/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful — redirecting to dashboard...");
        setTimeout(() => navigate("/"), 400);
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Please enter your details</p>
          </div>

          <div className="auth-form">
            <label className="auth-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="auth-input"
              placeholder="Enter your username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />

            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="auth-input"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />

            <div className="forgot-link">
              <a href="#">Forgot password?</a>
            </div>

            {error && <div className="auth-message auth-error">{error}</div>}
            {message && <div className="auth-message auth-success">{message}</div>}

            <button
              className="auth-btn"
              onClick={handleLogin}
              disabled={loading || !loginData.username.trim() || !loginData.password.trim()}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </div>

        <div className="auth-visual">
          <div className="visual-image-wrapper">
            <img src={loginImage} alt="Login visual" className="visual-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
