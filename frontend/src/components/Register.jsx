import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    dob: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zipcode: "",
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

    // Check all required fields
    const requiredFields = [
      "firstname", "lastname", "email", "phone", "password", "confirm",
      "dob", "street", "barangay", "city", "province", "zipcode"
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace(/_/g, " ")} field.`);
        return;
      }
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Invalid email address.");
      return;
    }

    // Check phone format (10–15 digits)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Invalid phone number. Must be 10–15 digits.");
      return;
    }

    // Check password match
    if (formData.password !== formData.confirm) {
      alert("Passwords do not match!");
      return;
    }

    // Password strength check
    const password = formData.password;
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) passwordErrors.push("an uppercase letter");
    if (!/[a-z]/.test(password)) passwordErrors.push("a lowercase letter");
    if (!/[0-9]/.test(password)) passwordErrors.push("a number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) passwordErrors.push("a special character");

    if (passwordErrors.length > 0) {
      alert("Password must contain " + passwordErrors.join(", ") + ".");
      return;
    }

    // Date of birth check
    const today = new Date();
    const dob = new Date(formData.dob);
    if (dob >= today) {
      alert("Date of birth cannot be in the future.");
      return;
    }

    // If all validations pass, send request
    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: formData.firstname,
          middlename: formData.middlename,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dob: formData.dob,
          street: formData.street,
          barangay: formData.barangay,
          city: formData.city,
          province: formData.province,
          zipcode: formData.zipcode,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        alert(data.message);
        window.location.href = "/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
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
            <p>Start your journey — whether you’re a tenant or an owner, we’ve got you covered.</p>
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
              Register
            </h2>

            <form onSubmit={handleSubmit}>
              {[
                { label: "First Name", name: "firstname" },
                { label: "Middle Name (optional)", name: "middlename" },
                { label: "Last Name", name: "lastname" },
                { label: "Email", name: "email", type: "email" },
                { label: "Phone", name: "phone", type: "tel" },
                { label: "Date of Birth", name: "dob", type: "date" },
                { label: "Street", name: "street" },
                { label: "Barangay", name: "barangay" },
                { label: "City", name: "city" },
                { label: "Province", name: "province" },
                { label: "Zip Code", name: "zipcode" },
              ].map((field) => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.name !== "middlename"}
                  />
                </div>
              ))}

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
