import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./../styles/Forgot.css";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password
  const [code, setCode] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Handle email submission ---
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email.");

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
        alert("Verification code sent to your email!");
        setStep(2);
      } else {
        alert(data.message || "Failed to send verification code.");
      }
    } catch (error) {
      setLoading(false);
      alert("Error connecting to the server.");
    }
  };

  // --- Handle code input ---
  const handleCodeChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  // --- Verify code ---
  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) return alert("Please enter the complete 6-digit code.");

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
        alert("Code verified successfully!");
        setStep(3); // ✅ Move to New Password modal
      } else {
        alert(data.message || "Invalid code.");
      }
    } catch (error) {
      setLoading(false);
      alert("Error connecting to the server.");
    }
  };

  // --- Reset password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return alert("Please fill both password fields.");
    if (password !== confirmPassword) return alert("Passwords do not match.");

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/forgot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  email,
  new_password: password,
  confirm_password: confirmPassword
  
}),

      });
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("Password reset successfully!");
        setStep(1); // back to email form
        setEmail("");
        setCode(Array(6).fill(""));
        setPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setLoading(false);
      alert("Error connecting to the server.");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-wrapper">
        <div className="forgot-left">
          <div className="forgot-text">
            <h1>Forgot Password?</h1>
            <p>Don’t worry — we’ve got you covered. Follow the steps to reset your password.</p>
          </div>
        </div>

        <div className="forgot-right">
          <div className="forgot-card">
            {/* Step 1: Enter email */}
            {step === 1 && (
              <>
                <h2 className="forgot-title">Reset Password</h2>
                <form onSubmit={handleForgot}>
                  <div className="forgot-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="forgot-btn" disabled={loading}>
                    {loading ? "Sending..." : "Send Code"}
                  </button>
                  <div className="forgot-bottom-text">
                    Remembered password? <Link to="/login">Back to Login</Link>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Enter verification code */}
            {step === 2 && (
              <>
                <h2 className="forgot-title">Enter Verification Code</h2>
                <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  Please enter the 6-digit code sent to your email.
                </p>
                <form onSubmit={handleVerify}>
                  <div className="code-input-group">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(e.target.value, index)}
                        className="code-input"
                      />
                    ))}
                  </div>
                  <button type="submit" className="forgot-btn" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  <div className="forgot-bottom-text">
                    Didn’t receive code? <span onClick={() => handleForgot()} className="resend-link">Resend it</span>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: New password */}
            {step === 3 && (
              <>
                <h2 className="forgot-title">Set New Password</h2>
                <form onSubmit={handleResetPassword}>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="forgot-input"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="forgot-input"
                    required
                  />
                  <button type="submit" className="forgot-btn" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
