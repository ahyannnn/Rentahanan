import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../styles/Forgot.css";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password, 4=success
  const [code, setCode] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // inline error messages
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const codeRefs = useRef([]);

  // Auto-focus first empty code input when step 2 starts
  useEffect(() => {
    if (step === 2) {
      const firstEmptyIndex = code.findIndex((digit) => digit === "");
      if (firstEmptyIndex !== -1 && codeRefs.current[firstEmptyIndex]) {
        codeRefs.current[firstEmptyIndex].focus();
      }
    }
  }, [step]);

  // --- Handle email submission ---
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Please enter your email.");

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/forgot/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setStep(2);
        setError("");
      } else {
        setError(data.message || "Email not registered.");
      }
    } catch (error) {
      setLoading(false);
      setError("Error connecting to the server.");
    }
  };

  // --- Handle code input ---
  const handleCodeChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto focus next input
      if (value && index < 5) {
        codeRefs.current[index + 1].focus();
      }
      // Move back if deleted
      if (!value && index > 0) {
        codeRefs.current[index - 1].focus();
      }
    }
  };

  // --- Verify code ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const enteredCode = code.join("");
    if (enteredCode.length !== 6)
      return setError("Please enter the complete 6-digit code.");

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/forgot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setStep(3);
        setError("");
      } else {
        setError(data.message || "Invalid verification code.");
      }
    } catch (error) {
      setLoading(false);
      setError("Error connecting to the server.");
    }
  };

  // --- Reset password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword)
      return setError("Please fill both password fields.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/forgot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        // Go to success step
        setStep(4);
        setEmail("");
        setCode(Array(6).fill(""));
        setPassword("");
        setConfirmPassword("");
        setError("");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setLoading(false);
      setError("Error connecting to the server.");
    }
  };

  return (
    <div className="forgot-container-Forgot">
      <div className="forgot-wrapper-Forgot">
        <div className="forgot-left-Forgot">
          <div className="forgot-text-Forgot">
            <h1 className="forgot-heading-Forgot">Forgot Password?</h1>
            <p className="forgot-description-Forgot">
              Don't worry — we've got you covered. Follow the steps to reset your
              password.
            </p>
          </div>
        </div>

        <div className="forgot-right-Forgot">
          <div className="forgot-card-Forgot">
            {/* Step 1: Enter email */}
            {step === 1 && (
              <>
                <h2 className="forgot-title-Forgot">Reset Password</h2>
                <form onSubmit={handleForgot} className="forgot-form-Forgot">
                  <div className="forgot-form-group-Forgot">
                    <label className="forgot-label-Forgot">Email Address</label>
                    <input
                      className="forgot-input-Forgot"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {error && <p className="error-text-Forgot">{error}</p>}
                  </div>
                  <button type="submit" className="forgot-btn-Forgot" disabled={loading}>
                    {loading ? "Sending..." : "Send Code"}
                  </button>
                  <div className="forgot-bottom-text-Forgot">
                    Remembered password? <Link to="/login" className="forgot-link-Forgot">Back to Login</Link>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Enter verification code */}
            {step === 2 && (
              <>
                <h2 className="forgot-title-Forgot">Enter Verification Code</h2>
                <p className="forgot-instruction-Forgot">
                  Please enter the 6-digit code sent to your email.
                </p>
                <form onSubmit={handleVerify} className="forgot-form-Forgot">
                  <div className="code-input-group-Forgot">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        ref={(el) => (codeRefs.current[index] = el)}
                        onChange={(e) => handleCodeChange(e.target.value, index)}
                        className="code-input-Forgot"
                      />
                    ))}
                  </div>
                  {error && <p className="error-text-Forgot">{error}</p>}
                  <button type="submit" className="forgot-btn-Forgot" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  <div className="forgot-bottom-text-Forgot">
                    Didn't receive code?{" "}
                    <span onClick={() => handleForgot()} className="resend-link-Forgot">
                      Resend it
                    </span>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
              <>
                <h2 className="forgot-title-Forgot">Set New Password</h2>
                <form onSubmit={handleResetPassword} className="forgot-form-Forgot">
                  {/* New Password */}
                  <div className="forgot-form-group-Forgot">
                    <label className="forgot-label-Forgot">New Password</label>
                    <div className="forgot-input-wrapper-Forgot">
                      <input
                        className="forgot-input-Forgot"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password-Forgot"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="forgot-form-group-Forgot">
                    <label className="forgot-label-Forgot">Confirm Password</label>
                    <div className="forgot-input-wrapper-Forgot">
                      <input
                        className="forgot-input-Forgot"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password-Forgot"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  {error && <p className="error-text-Forgot">{error}</p>}

                  <button type="submit" className="forgot-btn-Forgot" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}

            {/* Step 4: Success message */}
            {step === 4 && (
              <div className="forgot-success-Forgot">
                <h2 className="forgot-title-Forgot">Password Changed Successfully</h2>
                <p className="forgot-success-message-Forgot">
                  Your password has been updated. You can now log in using your new password.
                </p>
                <button
                  className="forgot-btn-Forgot"
                  onClick={() => (window.location.href = "/login")}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgot;