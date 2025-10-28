import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import "../../styles/tenant/Contract.css";

const Contract = () => {
  const [contract, setContract] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const sigCanvas = useRef();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const tenantId = storedUser?.tenantid;

  useEffect(() => {
    const fetchContract = async () => {
      try {
        if (!tenantId) {
          console.error("No tenant ID found in localStorage.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/contracts/tenant/${tenantId}`
        );

        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setContract(data[0]);
        } else if (data && data.contractid) {
          setContract(data);
        } else {
          console.warn("No contract found for tenant:", tenantId);
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
    return <p className="loading-text-Contract">Loading your contract...</p>;
  }

  const contractURL = contract.signed_contract
    ? `http://localhost:5000/uploads/signed_contracts/${contract.signed_contract}`
    : `http://localhost:5000/uploads/contracts/${contract.generated_contract}`;

  return (
    <div className="contract-container-Contract">
      <h1 className="contract-title-Contract">My Contract</h1>

      {/* Contract Summary Cards */}
      <div className="contract-summary-Contract">
        <div className="summary-card-Contract summary-card-unit-Contract">
          <p className="summary-label-Contract">Unit</p>
          <p className="summary-value-Contract">{contract.unit_name}</p>
        </div>
        <div className="summary-card-Contract summary-card-price-Contract">
          <p className="summary-label-Contract">Price</p>
          <p className="summary-value-Contract">₱{contract.unit_price}</p>
        </div>
        <div className="summary-card-Contract summary-card-start-date-Contract">
          <p className="summary-label-Contract">Start Date</p>
          <p className="summary-value-Contract">{contract.start_date}</p>
        </div>
        <div className="summary-card-Contract summary-card-end-date-Contract">
          <p className="summary-label-Contract">End Date</p>
          <p className="summary-value-Contract">{contract.end_date || "Ongoing"}</p>
        </div>
        <div className="summary-card-Contract summary-card-status-Contract">
          <p className="summary-label-Contract">Status</p>
          <p className={`summary-value-Contract status-value-Contract status-${contract.status ? contract.status.toLowerCase() : ""}-Contract`}>
            {contract.status || "N/A"}
          </p>
        </div>
      </div>

      {/* Contract Preview */}
      <div className="contract-preview-Contract">
        <div className="contract-file-info-Contract">
          <div className="pdf-icon-Contract">📄</div>
          <p className="file-label-Contract"><strong>Contract File:</strong></p>
        </div>
        <button 
          className="open-btn-Contract" 
          onClick={() => window.open(contractURL, "_blank")}
        >
          Open Contract
        </button>
      </div>

      {/* Signature Section */}
      {!contract.signed_contract && !isSigning && (
        <div className="sign-button-container-Contract">
          <button className="sign-btn-Contract" onClick={handleSignClick}>
            Sign Contract
          </button>
        </div>
      )}

      {isSigning && (
        <div className="signature-area-Contract">
          <p className="signature-instruction-Contract">Sign below:</p>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 400,
              height: 200,
              className: "sigCanvas-Contract",
            }}
          />
          <div className="signature-buttons-Contract">
            <button className="clear-btn-Contract" onClick={handleClear}>Clear</button>
            <button className="save-signature-btn-Contract" onClick={handleSaveSignature}>Save Signature</button>
          </div>
        </div>
      )}

      {contract.signed_contract && (
        <div className="signed-message-Contract">
          <p className="signed-text-Contract">You've already signed this contract.</p>
          <p className="signed-file-info-Contract">
            Signed file:{" "}
            <strong className="signed-filename-Contract">{contract.signed_contract}</strong>{" "}
            <button 
              className="view-signed-btn-Contract"
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