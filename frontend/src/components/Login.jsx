import React, { useState } from "react";
import "./../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ new state
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary dummy login (replace with your backend API)
    if (email === "test@gmail.com" && password === "1234") {
      navigate("/landing");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side */}
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

      {/* Right Side */}
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

            {/* Password Input with Show/Hide */}
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
              <button>Login with Google</button>
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
