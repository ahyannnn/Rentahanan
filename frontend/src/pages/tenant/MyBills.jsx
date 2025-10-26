import React, { useState } from "react";
import "../../styles/tenant/MyBills.css";

const MyBills = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [gcashRef, setGcashRef] = useState("");
  const [gcashReceipt, setGcashReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);

  // 🔹 Static example bills for UI preview
  const sampleBills = [
    { billid: "BI01", billtype: "Water", amount: 450, duedate: "2025-10-30", status: "Unpaid" },
    { billid: "BI02", billtype: "Electricity", amount: 980, duedate: "2025-10-31", status: "Unpaid" },
    { billid: "BI03", billtype: "Rent", amount: 5000, duedate: "2025-10-25", status: "Pending" },
    { billid: "BI04", billtype: "Internet", amount: 1200, duedate: "2025-11-05", status: "Paid" },
  ];

  // Calculate selected total
  const selectedTotalAmount = selectedBills.reduce((sum, billId) => {
    const bill = sampleBills.find((b) => b.billid === billId);
    return sum + (bill ? bill.amount : 0);
  }, 0);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPaymentMethod("cash");
    setGcashRef("");
    setGcashReceipt(null);
  };

  const handleSubmitPayment = async () => {
    if (selectedBills.length === 0) return;

    // 🔹 Validate input before submitting
    if (paymentMethod === "gcash") {
      const refPattern = /^\d{13}$/;

      if (!gcashRef || !refPattern.test(gcashRef)) {
        alert("Please enter a valid 13-digit GCash reference number.");
        return;
      }

      if (!gcashReceipt) {
        alert("Please upload your GCash receipt before submitting.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      for (const billId of selectedBills) {
        const formData = new FormData();
        formData.append("paymentType", paymentMethod === "cash" ? "Cash" : "GCash");
        if (paymentMethod === "gcash") {
          formData.append("gcashRef", gcashRef);
          formData.append("gcashReceipt", gcashReceipt);
        }

        const response = await fetch(
          `http://localhost:5000/api/bills/pay/${billId}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Payment update failed");
      }

      alert("Bills submitted for validation!");
      handleCloseModal();
      setSelectedBills([]); // Clear selection after successful payment
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert(error.message || "Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle receipt view
  const handleViewReceipt = (billId) => {
    alert(`Viewing receipt for ${billId}`);
    // Add receipt viewing logic here
  };

  return (
    <div className="bills-invoice-container">
      <div className="page-header">
        <h2>My Bills & Invoices</h2>
        <p className="bills-description">View, manage, and keep track of your recent bills.</p>
      </div>

      {/* 🧾 Bills Table */}
      <div className="bills-table-wrapper">
        <table className="bills-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Bill ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sampleBills.length > 0 ? (
              sampleBills.map((bill) => {
                const isUnpaid = bill.status.toLowerCase() === "unpaid";
                const isPending = bill.status.toLowerCase() === "pending";
                const isPaid = bill.status.toLowerCase() === "paid";
                const isSelectable = isUnpaid; // Only unpaid bills can be selected
                
                return (
                  <tr key={bill.billid}>
                    <td>
                      <input
                        type="checkbox"
                        className="bill-checkbox"
                        checked={selectedBills.includes(bill.billid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBills([...selectedBills, bill.billid]);
                          } else {
                            setSelectedBills(selectedBills.filter((id) => id !== bill.billid));
                          }
                        }}
                        disabled={!isSelectable}
                      />
                    </td>
                    <td>{bill.billid}</td>
                    <td>{bill.billtype}</td>
                    <td>₱{Number(bill.amount).toLocaleString()}</td>
                    <td>{bill.duedate}</td>
                    <td className={`status status-${bill.status.toLowerCase()}`}>
                      {bill.status}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isUnpaid ? (
                        <button className="action-btn pay-now-btn">
                          Pay Now
                        </button>
                      ) : isPending ? (
                        <button className="action-btn pending-btn" disabled>
                          For Validation
                        </button>
                      ) : (
                        <button 
                          className="action-btn receipt-btn"
                          onClick={() => handleViewReceipt(bill.billid)}
                        >
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bottom-actions">
        <div className="payment-summary-row">
          <div className="total-value">
            <span className="total-label">Total Value:</span>
            <span className="total-amount">₱{selectedTotalAmount.toLocaleString()}</span>
          </div>
          <button
            className="proceed-btn"
            onClick={handleOpenModal}
            disabled={selectedBills.length === 0}
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* 💳 Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="payments-modal no-scroll" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={handleCloseModal}>
                &lt;
              </button>
              <h3>Payments</h3>
            </div>

            <div className="modal-content">
              {/* Compact Bill Summary */}
              <div className="bill-summary-compact">
                <p>
                  <strong>Selected Bills ({selectedBills.length}):</strong>
                </p>
                <div className="compact-bill-list">
                  {sampleBills
                    .filter((bill) => selectedBills.includes(bill.billid))
                    .map((bill) => (
                      <div key={bill.billid} className="compact-bill-item">
                        <span className="bill-type">#{bill.billid}</span>
                        <span className="bill-amount">₱{bill.amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
                <div className="total-amount-row">
                  <span>Total Amount:</span>
                  <strong>₱{selectedTotalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="payment-method-section">
                <p>
                  <strong>Payment Method:</strong>
                </p>

                {/* Cash Card */}
                <div
                  className={`payment-card ${paymentMethod === "cash" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <h4>💵 Cash</h4>
                  <p>Prepare cash payment. Owner will validate.</p>
                </div>

                {/* GCash Card */}
                <div
                  className={`payment-card ${paymentMethod === "gcash" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("gcash")}
                >
                  <h4>📱 GCash</h4>
                  <p>Send the total amount to the owner's GCash account.</p>

                  {paymentMethod === "gcash" && (
                    <div className="gcash-details-compact">
                      <div className="gcash-account-info">
                        <div className="account-info-row">
                          <span className="account-label">Account Name:</span>
                          <span className="account-value">Maria Dela Cruz</span>
                        </div>
                        <div className="account-info-row">
                          <span className="account-label">Account Number:</span>
                          <span className="account-value">0917-XXX-XXXX</span>
                        </div>
                      </div>

                      <div className="gcash-input-row">
                        <label>Ref No.:</label>
                        <input
                          type="text"
                          placeholder="1234567890123"
                          className="ref-input"
                          value={gcashRef}
                          onChange={(e) => setGcashRef(e.target.value)}
                        />
                      </div>

                      <div className="gcash-input-row">
                        <label>Upload Proof:</label>
                        <label className="choose-file-btn">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => setGcashReceipt(e.target.files[0])}
                          />
                        </label>
                        {gcashReceipt && <span className="file-name">{gcashReceipt.name}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="submit-btn"
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;