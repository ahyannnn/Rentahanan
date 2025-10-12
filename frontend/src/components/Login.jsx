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
<<<<<<< HEAD
      // Call your backend API for login
      const response = await fetch("http://localhost:5000/api/login", {
=======
      const response = await fetch("http://127.0.0.1:5000/api/login", {
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed!");
        return;
      }

<<<<<<< HEAD
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
=======
      if (!data.user) {
        alert("Unexpected server response. Please try again.");
        return;
      }

      const { role, application_status } = data.user;

      if (!role) {
        alert("User role not found.");
        return;
      }

      // ✅ Save role and applicationStatus to localStorage for later use
      localStorage.setItem("userRole", role);
      if (role.toLowerCase() === "tenant") {
        localStorage.setItem("applicationStatus", application_status || "Pending");
        console.log("Application Status:", application_status);
      }

      // ✅ Navigate based on role
      if (role.toLowerCase() === "owner") {
        navigate("/owner-dashboard");
      } else if (role.toLowerCase() === "tenant") {
        navigate("/tenant");
      } else {
        navigate("/landing");
      }

>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3
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

<<<<<<< HEAD
export default Login;
=======
export default Login;
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3
