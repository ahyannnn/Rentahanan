import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../styles/Register.css";

// Global variables for Firebase (not used in this simplified example, but kept for context)
const __initial_auth_token = "";
const __app_id = "phome-registration-app";
const __firebase_config = "{}";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    dob: "",
    email: "",
    phone: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zipcode: "",
    password: "",
    confirm: "",
  });

  // State to manage all validation errors
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for the current field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // --- VALIDATION FUNCTIONS ---

  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.firstname) newErrors.firstname = "First name is required.";
    if (!formData.lastname) newErrors.lastname = "Last name is required.";
    if (!formData.dob) newErrors.dob = "Date of Birth is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email address is required.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!formData.street) newErrors.street = "Street address is required.";
    if (!formData.barangay) newErrors.barangay = "Barangay is required.";
    if (!formData.city) newErrors.city = "City/Municipality is required.";
    if (!formData.province) newErrors.province = "Province is required.";
    if (!formData.zipcode) newErrors.zipcode = "Zip Code is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    let newErrors = {};
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirm) newErrors.confirm = "Confirm password is required.";
    else if (formData.password !== formData.confirm) {
      newErrors.confirm = "Passwords do not match.";
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- NAVIGATION HANDLERS ---

  const handleNext = () => {
    let isValid = false;
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    try {
      // NOTE: Using a mock endpoint since the actual backend is not available
      // const res = await fetch("http://127.0.0.1:5000/api/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      
      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isSuccess = true; // Replace with actual API check: res.status === 201

      if (isSuccess) {
        setStep(4); // Show success step
      } else {
        // Handle API error, e.g., if email already exists
        // setErrors({ general: data.message });
      }
    } catch (error) {
      console.error(error);
      // setErrors({ general: "Something went wrong. Please try again." });
    }
  };

  // --- RENDER ---

  return (
    <div className="auth-wrapper">
      <div className="auth-page">
        <div className="auth-left">
          <div className="overlay"></div>
          <div className="auth-left-content">
            <h1>
              Join <span>PHOME</span>
            </h1>
            <p>
              Start your journey — whether you’re a tenant or an owner, we’ve
              got you covered.
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            {step !== 4 && (
              <h2 className="auth-title">
                {step === 1 && "Personal Information"}
                {step === 2 && "Contact & Address"}
                {step === 3 && "Create Password"}
              </h2>
            )}

            {step === 4 ? (
              <div className="success-step">
                <h2>Account Created Successfully</h2>
                <p>Your PHOME account has been created successfully.</p>
                <button
                  className="btn"
                  style={{ marginTop: "25px" }}
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                      />
                      {errors.firstname && <p className="error-text">{errors.firstname}</p>}
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                        name="middlename"
                        value={formData.middlename}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                      />
                      {errors.lastname && <p className="error-text">{errors.lastname}</p>}
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                      {errors.dob && <p className="error-text">{errors.dob}</p>}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="three-column-grid">
                    
                    <div className="form-group span-2">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {/* FIX: Use the specific error-email wrapper for correct left alignment */}
                      <div className="error-email">
                        {errors.email && <p className="error-text">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && <p className="error-text">{errors.phone}</p>}
                    </div>

                    <div className="form-group span-3">
                      <label>Street Address</label>
                      <input
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                      />
                      {errors.street && <p className="error-text">{errors.street}</p>}
                    </div>
                    
                    <div className="form-group">
                      <label>Barangay</label>
                      <input
                        name="barangay"
                        value={formData.barangay}
                        onChange={handleChange}
                      />
                      {errors.barangay && <p className="error-text">{errors.barangay}</p>}
                    </div>

                    <div className="form-group">
                      <label>City</label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                      {errors.city && <p className="error-text">{errors.city}</p>}
                    </div>

                    <div className="form-group">
                      <label>Province</label>
                      <input
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                      />
                      {errors.province && <p className="error-text">{errors.province}</p>}
                    </div>

                    <div className="form-group">
                      <label>Zip Code</label>
                      <input
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleChange}
                      />
                      {errors.zipcode && <p className="error-text">{errors.zipcode}</p>}
                    </div>

                  </div>
                )}

                {step === 3 && (
                  <>
                    <div className="form-group password-group">
                      <label>Password</label>
                      <div className="password-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="show-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>
                    <div className="form-group password-group">
                      <label>Confirm Password</label>
                      <div className="password-wrapper">
                        <input
                          type={showConfirm ? "text" : "password"}
                          name="confirm"
                          value={formData.confirm}
                          onChange={handleChange}
                        />
                        <button
                          type="submit"
                          className="show-btn"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                      {errors.confirm && <p className="error-text">{errors.confirm}</p>}
                    </div>
                  </>
                )}

                {step < 4 && (
                  <div className="form-buttons">
                    {step > 1 && (
                      <button
                        type="submit"
                        onClick={handlePrev}
                        className="btn secondary"
                      >
                        Back
                      </button>
                    )}
                    {step < 3 && (
                      <button type="submit" onClick={handleNext} className="btn">
                        Next
                      </button>
                    )}
                    {step === 3 && (
                      <button type="submit" className="btn">
                        Create
                      </button>
                    )}
                  </div>
                )}

                {step < 4 && (
                  <p className="bottom-text">
                    Already have an account? <Link to="/login">Login</Link>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
