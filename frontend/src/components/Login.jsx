import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed!");
        return;
      }

      if (!data.user) {
        alert("Unexpected server response. Please try again.");
        return;
      }

      const {
        role,
        application_status,
        userid,
        fullname,
        email: userEmail,
        phone,
        unitid,
      } = data.user;

      localStorage.setItem("userId", userid);
      localStorage.setItem("fullName", fullname);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("phone", phone);
      localStorage.setItem("userRole", role);
      localStorage.setItem("unitId", unitid || "");

      if (role.toLowerCase() === "tenant") {
        localStorage.setItem("applicationStatus", application_status || "Registered");
      }

      if (role.toLowerCase() === "owner") {
        navigate("/owner");
      } else if (role.toLowerCase() === "tenant") {
        navigate(
          application_status === "Registered" ? "/tenant/browse-units" : "/tenant"
        );
      } else {
        navigate("/landing");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-page">
        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <div className="auth-card">
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#061A53",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Login
            </h2>

            <form onSubmit={handleLogin}>
              {/* EMAIL */}
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

              {/* PASSWORD */}
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

                {/* 💡 NEW Forgot Password Link */}
                <div className="forgot-link">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
              </div>

              {/* BUTTONS */}
              <button className="btn" type="submit">
                Login
              </button>

              <span className="or-text">OR</span>

              <div className="social-login">
                <button type="button">Login with Google</button>
              </div>

              <div className="bottom-text">
                Don’t have an account? <Link to="/register">Register</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
