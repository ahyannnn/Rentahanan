import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import "../../styles/tenant/Contract.css";

const Contract = () => {
  const [contract, setContract] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const sigCanvas = useRef();

  const tenantId = localStorage.getItem("tenantId");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/contracts/tenant/${tenantId}`
        );
        if (response.data.length > 0) {
          setContract(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
      }
    };
    fetchContract();
  }, [tenantId]);

  const handleSignClick = () => setIsSigning(true);

  const handleSaveSignature = async () => {
    try {
      const canvas = sigCanvas.current.getCanvas();
      const signatureImage = canvas.toDataURL("image/png");
      const blob = await (await fetch(signatureImage)).blob();

      const formData = new FormData();
      formData.append("signed_contract", blob, `signed_${tenantId}.png`);
      formData.append("contractid", contract.contractid);

      const response = await axios.post(
        "http://localhost:5000/api/contracts/sign",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.message) {
        alert("✅ Contract signed successfully!");
        setContract((prev) => ({
          ...prev,
          signed_contract: response.data.filename,
        }));
        setIsSigning(false);
      } else {
        alert("❌ Error saving signed contract.");
      }
    } catch (error) {
      console.error("Error signing contract:", error);
      alert("Failed to upload signed contract.");
    }
  };

  const handleClear = () => sigCanvas.current.clear();

  if (!contract) {
    return <p>Loading your contract...</p>;
  }

  const contractURL = contract.signed_contract
    ? `http://localhost:5000/uploads/signed_contracts/${contract.signed_contract}`
    : `http://localhost:5000/uploads/contracts/${contract.generated_contract}`;

  return (
    <div className="contract-container">
      <h1 className="contract-title">My Contract</h1>

      {/* ✅ Contract Summary Cards */}
      <div className="contract-summary">
        <div className="summary-card">
          <p className="label">Unit</p>
          <p className="value">{contract.unit_name}</p>
        </div>
        <div className="summary-card">
          <p className="label">Price</p>
          <p className="value">₱{contract.unit_price}</p>
        </div>
        <div className="summary-card">
          <p className="label">Start Date</p>
          <p className="value">{contract.start_date}</p>
        </div>
        <div className="summary-card">
          <p className="label">End Date</p>
          <p className="value">{contract.end_date || "Ongoing"}</p>
        </div>
        <div className="summary-card">
          <p className="label">Status</p>
          <p className={`value status ${contract.status.toLowerCase()}`}>
            {contract.status}
          </p>
        </div>
      </div>

      {/* ✅ Contract Preview */}
      <div className="contract-preview">
        <div className="pdf-icon">📄</div>
        <p><strong>Contract File:</strong></p>
        <button
          className="open-btn"
          onClick={() => window.open(contractURL, "_blank")}
        >
          Open Contract
        </button>
      </div>

      {/* ✅ Signature Section */}
      {!contract.signed_contract && !isSigning && (
        <button className="sign-btn" onClick={handleSignClick}>
          Sign Contract
        </button>
      )}

      {isSigning && (
        <div className="signature-area">
          <p>Sign below:</p>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 400,
              height: 200,
              className: "sigCanvas",
            }}
          />
          <div className="signature-buttons">
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleSaveSignature}>Save Signature</button>
          </div>
        </div>
      )}

      {contract.signed_contract && (
        <div className="signed-message">
          <p>You’ve already signed this contract.</p>
          <p>
            Signed file:{" "}
            <strong>{contract.signed_contract}</strong>{" "}
            <button
              onClick={() =>
                window.open(
                  `http://localhost:5000/uploads/signed_contracts/${contract.signed_contract}`,
                  "_blank"
                )
              }
            >
              View Signed Copy
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Contract;
