import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    // --- CLIENT-SIDE VALIDATION ---
    if (!email) {
      setEmailError("Email address is required.");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    if (!isValid) return;

    // --- SERVER REQUEST ---
    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Assign errors based on backend message
        if (data.message === "Email not registered") {
          setEmailError("Email not registered");
        } else if (data.message === "Incorrect password") {
          setPasswordError("Incorrect password");
        } else {
          // Fallback unknown error
          setEmailError("Email not registered");
        }
        return;
      }

      if (!data.user) {
        setEmailError("Unexpected response. Please try again.");
        return;
      }

      // --- SUCCESSFUL LOGIN ---
      const {
        role,
        application_status,
        userid,
        tenantid,
        fullname,
        email: userEmail,
        phone,
        unitid,
      } = data.user;

      localStorage.setItem("userId", userid);
      localStorage.setItem("tenantId", tenantid);
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
      setEmailError("Network error. Please check your connection.");
    }
  };

  const errorStyle = {
    color: "red",
    textAlign: "left",
    marginTop: "5px",
    fontSize: "0.875rem",
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
                />
                {emailError && <p style={errorStyle}>{emailError}</p>}
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
                  />
                  <button
                    type="button"
                    className="show-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {passwordError && (
                  <p style={{ ...errorStyle, marginTop: "10px" }}>
                    {passwordError}
                  </p>
                )}

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
