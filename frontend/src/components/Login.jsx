import React, { useState } from "react";
import "./../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Call your backend API for login
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed!");
        return;
      }

      // Example response:
      // { role: "Tenant", applicationStatus: "Pending" }

      const { role, applicationStatus } = data;

      if (role.toLowerCase() === "owner") {
        navigate("/owner-dashboard");
      } else if (role.toLowerCase() === "tenant") {
        switch (applicationStatus) {
          case "Pending":
            navigate("/tenant-pending");
            break;
          case "Approved":
            navigate("/tenant-dashboard");
            break;
          case "Rejected":
            navigate("/tenant-rejected");
            break;
          default:
            navigate("/tenant-dashboard");
        }
      } else {
        navigate("/landing");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="overlay"></div>
        <div className="auth-left-content">
          <h1>Welcome Back!</h1>
          <p>
            Log in to explore available <span>houses</span> and manage your
            listings effortlessly.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="btn" type="submit">
              Login
            </button>

            <span className="or-text">OR</span>
            <div className="social-login">
              <button type="button">Login with Google</button>
            </div>

            <div className="bottom-text">
              Don’t have an account? <Link to="/register">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
