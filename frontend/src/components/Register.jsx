import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../styles/Register.css";

// Global variables for Firebase (not used in this simplified example, but kept for context)
const __initial_auth_token = "";
const __app_id = "phome-registration-app";
const __firebase_config = "{}";

const Register = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "", // Initialized as empty
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
    // Clear general error when user makes any change
    if (errors.general) {
      setErrors({ ...errors, general: "" });
    }
  };

  // --- VALIDATION FUNCTIONS ---

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^09\d{9}$/; // Philippine mobile format
    return phoneRegex.test(phone);
  };

  const validateZipCode = (zipcode) => {
    const zipRegex = /^\d{4}$/; // Philippine zip code format
    return zipRegex.test(zipcode);
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required.";
    if (!formData.middlename.trim()) newErrors.middlename = "Middle name is required.";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required.";
    
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required.";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dob = "You must be at least 18 years old.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Philippine mobile number (09XXXXXXXXX).";
    }
    
    if (!formData.street.trim()) newErrors.street = "Street address is required.";
    if (!formData.barangay.trim()) newErrors.barangay = "Barangay is required.";
    if (!formData.city.trim()) newErrors.city = "City/Municipality is required.";
    if (!formData.province.trim()) newErrors.province = "Province is required.";
    
    if (!formData.zipcode.trim()) {
      newErrors.zipcode = "Zip Code is required.";
    } else if (!validateZipCode(formData.zipcode)) {
      newErrors.zipcode = "Please enter a valid 4-digit zip code.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    let newErrors = {};
    
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
    }
    
    if (!formData.confirm) {
      newErrors.confirm = "Confirm password is required.";
    } else if (formData.password !== formData.confirm) {
      newErrors.confirm = "Passwords do not match.";
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

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setStep(4); // Show success step
      } else {
        const errorData = await res.json();
        setErrors({ general: errorData.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---

  return (
    <div className="auth-wrapper-Register">
      <div className="auth-page-Register">
        <div className="auth-left-Register">
          <div className="overlay-Register"></div>
          <div className="auth-left-content-Register">
            <h1>
              Join <span>RenTahanan</span>
            </h1>
            <p>
              Start your journey — whether you're a tenant or an owner, we've
              got you covered.
            </p>
          </div>
        </div>

        <div className="auth-right-Register">
          <div className="auth-card-Register">
            {step !== 4 && (
              <h2 className="auth-title-Register">
                {step === 1 && "Personal Information"}
                {step === 2 && "Contact & Address"}
                {step === 3 && "Create Password"}
              </h2>
            )}

            {step === 4 ? (
              <div className="success-step-Register">
                <h2>Account Created Successfully</h2>
                <p>Your RenTahanan account has been created successfully.</p>
                <button
                  className="btn-Register" 
                  style={{ marginTop: "25px" }}
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form-Register">
                {/* General error message */}
                {errors.general && (
                  <div className="error-general-Register">
                    {errors.general}
                  </div>
                )}

                {step === 1 && (
                  <>
                    <div className="form-group-Register">
                      <label className="label-Register">First Name</label>
                      <input
                        className="input-Register"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        placeholder="Enter First Name"
                      />
                      {errors.firstname && <p className="error-text-Register">{errors.firstname}</p>}
                    </div>
                    <div className="form-group-Register">
                      <label className="label-Register">Middle Name</label>
                      <input
                        className="input-Register"
                        name="middlename"
                        value={formData.middlename}
                        onChange={handleChange}
                        placeholder="Enter Middle Name"
                      />
                      {errors.middlename && <p className="error-text-Register">{errors.middlename}</p>} 
                    </div>
                    <div className="form-group-Register">
                      <label className="label-Register">Last Name</label>
                      <input
                        className="input-Register"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        placeholder="e.g. Dela Cruz"
                      />
                      {errors.lastname && <p className="error-text-Register">{errors.lastname}</p>}
                    </div>
                    <div className="form-group-Register">
                      <label className="label-Register">Date of Birth</label>
                      <input
                        className="input-Register"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      />
                      {errors.dob && <p className="error-text-Register">{errors.dob}</p>}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="three-column-grid-Register">
                    
                    <div className="form-group-Register span-2-Register">
                      <label className="label-Register">Email</label>
                      <input
                        className="input-Register"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. juan.delacruz@gmail.com"
                      />
                      <div className="error-email-Register">
                        {errors.email && <p className="error-text-Register">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="form-group-Register">
                      <label className="label-Register">Phone</label>
                      <input
                        className="input-Register"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 09171234567"
                        maxLength="11"
                      />
                      {errors.phone && <p className="error-text-Register">{errors.phone}</p>}
                    </div>

                    <div className="form-group-Register span-3-Register">
                      <label className="label-Register">Street Address</label>
                      <input
                        className="input-Register"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="e.g. Blk 1 Lot 2 Pinas St."
                      />
                      {errors.street && <p className="error-text-Register">{errors.street}</p>}
                    </div>
                    
                    <div className="form-group-Register">
                      <label className="label-Register">Barangay</label>
                      <input
                        className="input-Register"
                        name="barangay"
                        value={formData.barangay}
                        onChange={handleChange}
                        placeholder="e.g. San Jose"
                      />
                      {errors.barangay && <p className="error-text-Register">{errors.barangay}</p>}
                    </div>

                    <div className="form-group-Register">
                      <label className="label-Register">City</label>
                      <input
                        className="input-Register"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Makati"
                      />
                      {errors.city && <p className="error-text-Register">{errors.city}</p>}
                    </div>

                    <div className="form-group-Register">
                      <label className="label-Register">Province</label>
                      <input
                        className="input-Register"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        placeholder="e.g. Metro Manila"
                      />
                      {errors.province && <p className="error-text-Register">{errors.province}</p>}
                    </div>

                    <div className="form-group-Register">
                      <label className="label-Register">Zip Code</label>
                      <input
                        className="input-Register"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleChange}
                        placeholder="e.g. 1200"
                        maxLength="4"
                      />
                      {errors.zipcode && <p className="error-text-Register">{errors.zipcode}</p>}
                    </div>

                  </div>
                )}

                {step === 3 && (
                  <>
                    <div className="form-group-Register password-group-Register">
                      <label className="label-Register">Password</label>
                      <div className="password-wrapper-Register">
                        <input
                          className="input-Register"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="show-btn-Register"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {errors.password && <p className="error-text-Register">{errors.password}</p>}
                    </div>
                    <div className="form-group-Register password-group-Register">
                      <label className="label-Register">Confirm Password</label>
                      <div className="password-wrapper-Register">
                        <input
                          className="input-Register"
                          type={showConfirm ? "text" : "password"}
                          name="confirm"
                          value={formData.confirm}
                          onChange={handleChange}
                          placeholder="Re-enter your password"
                        />
                        <button
                          type="button"
                          className="show-btn-Register"
                          onClick={() => setShowConfirm(!showConfirm)}
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                      {errors.confirm && <p className="error-text-Register">{errors.confirm}</p>}
                    </div>
                  </>
                )}

                {step < 4 && (
                  <div className="form-buttons-Register">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="btn-Register secondary-Register"
                        disabled={isLoading}
                      >
                        Back
                      </button>
                    )}
                    {step < 3 && (
                      <button 
                        type="button" 
                        onClick={handleNext} 
                        className="btn-Register"
                        disabled={isLoading}
                      >
                        Next
                      </button>
                    )}
                    {step === 3 && (
                      <button 
                        type="submit" 
                        className="btn-Register"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </button>
                    )}
                  </div>
                )}

                {step < 4 && (
                  <p className="bottom-text-Register">
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