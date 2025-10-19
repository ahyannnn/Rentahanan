import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./../styles/Forgot.css";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1 = email form, 2 = enter code
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  // --- Handle email submission ---
  const handleForgot = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/forgot-password", {
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
      alert("Error connecting to the server. Check your backend.");
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

  const handleResend = async () => {
    if (!email) return alert("Missing email address.");
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("New verification code sent to your email!");
      } else {
        alert(data.message || "Failed to resend code.");
      }
    } catch (error) {
      setLoading(false);
      alert("Error connecting to the server. Check your backend.");
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      alert("Please enter the complete 6-digit code.");
      return;
    }
    alert("Preview mode: Code submitted!");
  };

  return (
    <div className="forgot-container">
      <div className="forgot-wrapper">
        <div className="forgot-left">
          <div className="forgot-text">
            <h1>Forgot Password?</h1>
            <p>
              Don’t worry — we’ve got you covered. Enter your{" "}
              <span>email address</span> below, and we’ll send you a link to
              reset your password.
            </p>
          </div>
        </div>

        <div className="forgot-right">
          <div className="forgot-card">
            {step === 1 ? (
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
            ) : (
              <>
                <h2 className="forgot-title">Enter Verification Code</h2>
                <p
                  style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    color: "#000", // ✅ black text
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
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
                        onChange={(e) =>
                          handleCodeChange(e.target.value, index)
                        }
                        className="code-input"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="forgot-btn"
                    style={{ marginTop: "1.5rem" }}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>

                  <div className="forgot-bottom-text">
                    Didn’t receive code?{" "}
                    <span onClick={handleResend} className="resend-link">
                      Resend it
                    </span>
                  </div>
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
