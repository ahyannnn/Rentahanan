import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import "../../styles/tenant/Contract.css";

const Contract = () => {
  const [contract, setContract] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const sigCanvas = useRef();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const tenantId = storedUser?.tenantid;

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        if (!tenantId) {
          console.error("No tenant ID found in localStorage.");
          setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [tenantId]);

  const handleSignClick = () => setIsSigning(true);
  const handleCancelSign = () => setIsSigning(false);

  const handleSaveSignature = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please provide your signature before saving.");
      return;
    }

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
          status: "Signed"
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

  if (loading) {
    return (
      <div className="loading-container-Contract">
        <div className="loading-spinner-Contract"></div>
        <p className="loading-text-Contract">Loading your contract...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="no-contract-container-Contract">
        <div className="no-contract-icon-Contract">📝</div>
        <h2 className="no-contract-title-Contract">No Contract Found</h2>
        <p className="no-contract-description-Contract">
          You don't have an active contract yet. Please contact the administrator for more information.
        </p>
      </div>
    );
  }

  const contractURL = contract.signed_contract
    ? `http://localhost:5000/uploads/signed_contracts/${contract.signed_contract}`
    : `http://localhost:5000/uploads/contracts/${contract.generated_contract}`;

  const getStatusIcon = (status) => {
    const icons = {
      "signed": "✅",
      "pending": "⏳",
      "rejected": "❌",
      "active": "🟢",
      "expired": "🔴"
    };
    return icons[status?.toLowerCase()] || "📄";
  };

  return (
    <div className="contract-container-Contract">
      {/* Header Section */}
      <div className="contract-header-Contract">
        <h1 className="contract-title-Contract">My Contract 📄</h1>
        <p className="contract-subtitle-Contract">Review and manage your rental agreement</p>
      </div>

      {/* Contract Summary Cards */}
      <div className="contract-summary-Contract">
        <div className="summary-card-Contract summary-card-unit-Contract">
          <div className="summary-icon-Contract">🏠</div>
          <div className="summary-content-Contract">
            <p className="summary-label-Contract">Unit</p>
            <p className="summary-value-Contract">{contract.unit_name || "N/A"}</p>
          </div>
        </div>
        
        <div className="summary-card-Contract summary-card-price-Contract">
          <div className="summary-icon-Contract">💰</div>
          <div className="summary-content-Contract">
            <p className="summary-label-Contract">Monthly Price</p>
            <p className="summary-value-Contract">₱{contract.unit_price?.toLocaleString() || "0"}</p>
          </div>
        </div>
        
        <div className="summary-card-Contract summary-card-dates-Contract">
          <div className="summary-icon-Contract">📅</div>
          <div className="summary-content-Contract">
            <p className="summary-label-Contract">Lease Period</p>
            <p className="summary-value-Contract">
              {contract.start_date} - {contract.end_date || "Ongoing"}
            </p>
          </div>
        </div>
        
        <div className="summary-card-Contract summary-card-status-Contract">
          <div className="summary-icon-Contract">{getStatusIcon(contract.status)}</div>
          <div className="summary-content-Contract">
            <p className="summary-label-Contract">Status</p>
            <p className={`summary-value-Contract status-value-Contract status-${contract.status ? contract.status.toLowerCase() : "unknown"}-Contract`}>
              {contract.status || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Actions Section */}
      <div className="contract-actions-Contract">
        {/* Contract Preview */}
        <div className="contract-preview-Contract">
          <div className="preview-header-Contract">
            <div className="contract-file-info-Contract">
              <div className="pdf-icon-Contract">📄</div>
              <div className="file-details-Contract">
                <p className="file-label-Contract">Contract Document</p>
                <p className="file-size-Contract">PDF Document</p>
              </div>
            </div>
            <button 
              className="open-btn-Contract" 
              onClick={() => window.open(contractURL, "_blank")}
            >
              <span className="btn-icon-Contract">👁️</span>
              View Contract
            </button>
          </div>
        </div>

        {/* Signature Section */}
        {!contract.signed_contract && !isSigning && (
          <div className="signature-prompt-Contract">
            <div className="prompt-content-Contract">
              <div className="prompt-icon-Contract">✍️</div>
              <div className="prompt-text-Contract">
                <h3 className="prompt-title-Contract">Ready to Sign?</h3>
                <p className="prompt-description-Contract">
                  Review the contract above and sign digitally to complete the agreement process.
                </p>
              </div>
            </div>
            <button className="sign-btn-Contract" onClick={handleSignClick}>
              <span className="btn-icon-Contract">🖊️</span>
              Sign Contract
            </button>
          </div>
        )}

        {isSigning && (
          <div className="signature-area-Contract">
            <div className="signature-header-Contract">
              <h3 className="signature-title-Contract">Digital Signature</h3>
              <p className="signature-instruction-Contract">Sign in the box below using your mouse or touchscreen</p>
            </div>
            
            <div className="signature-canvas-container-Contract">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#0a2d8d"
                backgroundColor="#f8faff"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "sigCanvas-Contract",
                }}
              />
            </div>
            
            <div className="signature-buttons-Contract">
              <button className="clear-btn-Contract" onClick={handleClear}>
                <span className="btn-icon-Contract">🗑️</span>
                Clear
              </button>
              <div className="signature-action-buttons-Contract">
                <button className="cancel-btn-Contract" onClick={handleCancelSign}>
                  Cancel
                </button>
                <button className="save-signature-btn-Contract" onClick={handleSaveSignature}>
                  <span className="btn-icon-Contract">💾</span>
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        )}

        {contract.signed_contract && (
          <div className="signed-message-Contract">
            <div className="signed-header-Contract">
              <div className="signed-icon-Contract">✅</div>
              <div className="signed-content-Contract">
                <h3 className="signed-title-Contract">Contract Signed</h3>
                <p className="signed-text-Contract">
                  You've successfully signed this contract on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="signed-actions-Contract">
              <p className="signed-file-info-Contract">
                Signed file: <strong className="signed-filename-Contract">{contract.signed_contract}</strong>
              </p>
              <button 
                className="view-signed-btn-Contract"
                onClick={() =>
                  window.open(
                    `http://localhost:5000/uploads/signed_contracts/${contract.signed_contract}`,
                    "_blank"
                  )
                }
              >
                <span className="btn-icon-Contract">👁️</span>
                View Signed Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contract Details */}
      <div className="contract-details-Contract">
        <h3 className="details-title-Contract">Contract Details</h3>
        <div className="details-grid-Contract">
          <div className="detail-item-Contract">
            <span className="detail-label-Contract">Contract ID:</span>
            <span className="detail-value-Contract">{contract.contractid}</span>
          </div>
          <div className="detail-item-Contract">
            <span className="detail-label-Contract">Created Date:</span>
            <span className="detail-value-Contract">{contract.created_date || "N/A"}</span>
          </div>
          <div className="detail-item-Contract">
            <span className="detail-label-Contract">Last Updated:</span>
            <span className="detail-value-Contract">{contract.updated_date || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;