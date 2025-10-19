import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./../styles/Register.css";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "", middlename: "", lastname: "", dob: "",
    email: "", phone: "", street: "", barangay: "",
    city: "", province: "", zipcode: "",
    password: "", confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Basic validation before next step
    if (step === 1 && (!formData.firstname || !formData.lastname || !formData.dob)) {
      return alert("Please fill in all personal information.");
    }
    if (step === 2 && (!formData.email || !formData.phone || !formData.street || !formData.barangay || !formData.city || !formData.province || !formData.zipcode)) {
      return alert("Please fill in all contact/address information.");
    }
    setStep(step + 1);
  };

  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirm) return alert("Fill password fields.");
    if (formData.password !== formData.confirm) return alert("Passwords do not match.");

    // Password strength check (optional)
    if (formData.password.length < 8) return alert("Password must be at least 8 characters.");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.status === 201) {
        alert(data.message);
        window.location.href = "/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Something went wrong.");
      console.error(error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-page">
        <div className="auth-left">
          <div className="overlay"></div>
          <div className="auth-left-content">
            <h1>Join <span>PHOME</span></h1>
            <p>Start your journey — whether you’re a tenant or an owner, we’ve got you covered.</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">
              {step === 1 && "Personal Information"}
              {step === 2 && "Contact & Address"}
              {step === 3 && "Create Password"}
            </h2>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label>First Name</label>
                    <input name="firstname" value={formData.firstname} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input name="middlename" value={formData.middlename} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input name="lastname" value={formData.lastname} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="two-columns">
                  <div className="column">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Street</label>
                      <input name="street" value={formData.street} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Barangay</label>
                      <input name="barangay" value={formData.barangay} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="column">
                    <div className="form-group">
                      <label>City</label>
                      <input name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <input name="province" value={formData.province} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input name="zipcode" value={formData.zipcode} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}


              {step === 3 && (
                <>
                  <div className="form-group password-group">
                    <label>Password</label>
                    <div className="password-wrapper">
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                      <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div className="form-group password-group">
                    <label>Confirm Password</label>
                    <div className="password-wrapper">
                      <input type={showConfirm ? "text" : "password"} name="confirm" value={formData.confirm} onChange={handleChange} />
                      <button type="button" className="show-btn" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="form-buttons">
                {step > 1 && <button type="button" onClick={handlePrev} className="btn secondary">Back</button>}
                {step < 3 && <button type="button" onClick={handleNext} className="btn">Next</button>}
                {step === 3 && <button type="submit" className="btn">Create Account</button>}
              </div>

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
