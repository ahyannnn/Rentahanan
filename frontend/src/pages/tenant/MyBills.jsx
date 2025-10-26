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
    { billid: "B101", billtype: "Water", amount: 450, duedate: "2025-10-30", status: "Unpaid" },
    { billid: "B102", billtype: "Electricity", amount: 980, duedate: "2025-10-31", status: "Unpaid" },
    { billid: "B103", billtype: "Rent", amount: 5000, duedate: "2025-10-25", status: "Pending" },
    { billid: "B104", billtype: "Internet", amount: 1200, duedate: "2025-11-05", status: "Paid" },
  ];

  const unpaidBills = sampleBills.filter((b) => b.status.toLowerCase() === "unpaid");
  const totalAmount = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  // Calculate selected total
  const selectedTotalAmount = selectedBills.reduce((sum, billId) => {
    const bill = sampleBills.find(b => b.billid === billId);
    return sum + (bill ? bill.amount : 0);
  }, 0);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPaymentMethod("cash");
    setGcashRef("");
    setGcashReceipt(null);
  };

  const handleSubmitPayment = () => {
    alert("Preview only: Payment submitted successfully!");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 1200);
  };

  const handleBillSelection = (billId, isUnpaid) => {
    if (!isUnpaid) return; // Only allow selection of unpaid bills

    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      } else {
        return [...prev, billId];
      }
    });
  };

  const isBillUnpaid = (status) => status.toLowerCase() === "unpaid";

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
            </tr>
          </thead>
          <tbody>
            {sampleBills.map((bill) => {
              const isUnpaid = isBillUnpaid(bill.status);
              return (
                <tr key={bill.billid}>
                  <td>
                    <input
                      type="checkbox"
                      className="bill-checkbox"
                      checked={selectedBills.includes(bill.billid)}
                      onChange={() => handleBillSelection(bill.billid, isUnpaid)}
                      disabled={!isUnpaid}
                    />
                  </td>
                  <td>#{bill.billid}</td>
                  <td>{bill.billtype}</td>
                  <td>₱{bill.amount.toLocaleString()}</td>
                  <td>{bill.duedate}</td>
                  <td className={`status ${bill.status.toLowerCase()}`}>{bill.status}</td>
                </tr>
              );
            })}
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
                <p><strong>Selected Bills ({selectedBills.length}):</strong></p>
                <div className="compact-bill-list">
                  {sampleBills
                    .filter(bill => selectedBills.includes(bill.billid))
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