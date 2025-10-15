import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        alert(data.message); // "User registered and application created!"
        // Redirect to login
        window.location.href = "/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };



  return (
    <div className="auth-wrapper">
      <div className="auth-page">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="overlay"></div>
          <div className="auth-left-content">
            <h1>
              Join <span>PHOME</span>
            </h1>
            <p>
              Start your journey — whether you’re a tenant or an owner, we’ve got
              you covered.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Title moved from CSS ::before to JSX */}
            <h2 style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#061A53",
              marginBottom: "2rem",
              textAlign: "center"
            }}>
              Register
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group password-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password */}
              <div className="form-group password-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    placeholder="Confirm your password"
                    value={formData.confirm}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="show-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn">
                Register
              </button>

              <p className="bottom-text">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
