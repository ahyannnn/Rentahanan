import React, { useState } from "react";
import "../../styles/tenant/MyBills.css";

const MyBills = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [gcashRef, setGcashRef] = useState("");
  const [gcashReceipt, setGcashReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Static example bills for UI preview
  const sampleBills = [
    { billid: "B101", billtype: "Water", amount: 450, duedate: "2025-10-30", status: "Unpaid" },
    { billid: "B102", billtype: "Electricity", amount: 980, duedate: "2025-10-31", status: "Unpaid" },
    { billid: "B103", billtype: "Rent", amount: 5000, duedate: "2025-10-25", status: "Pending" },
    { billid: "B104", billtype: "Internet", amount: 1200, duedate: "2025-11-05", status: "Paid" },
  ];

  const totalAmount = sampleBills
    .filter((b) => b.status.toLowerCase() === "unpaid")
    .reduce((sum, bill) => sum + bill.amount, 0);

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
              <th>Bill ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sampleBills.map((bill) => (
              <tr key={bill.billid}>
                <td>#{bill.billid}</td>
                <td>{bill.billtype}</td>
                <td>₱{bill.amount.toLocaleString()}</td>
                <td>{bill.duedate}</td>
                <td className={`status ${bill.status.toLowerCase()}`}>{bill.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-actions">
        <button className="proceed-btn" onClick={handleOpenModal}>
          Proceed to Payment
        </button>
      </div>

      {/* 💳 Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="payments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={handleCloseModal}>
                &lt;
              </button>
              <h3>Payments</h3>
            </div>

            <div className="modal-content">
              <div className="bill-summary">
                <p><strong>Selected Bills:</strong></p>
                <div className="bill-list">
                  {sampleBills
                    .filter((b) => b.status.toLowerCase() === "unpaid")
                    .map((bill) => (
                      <div key={bill.billid} className="bill-item">
                        <span>#{bill.billid} - {bill.billtype}</span>
                        <span>₱{bill.amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
                <div className="total-amount-row">
                  <span>Total Amount:</span>
                  <strong>₱{totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="payment-method-section">
                <p><strong>Payment Method:</strong></p>

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
                  <p>Send the total amount to the owner’s GCash account.</p>

                  {paymentMethod === "gcash" && (
                    <div className="gcash-details">
                      <label>Ref No.:</label>
                      <input
                        type="text"
                        placeholder="1234567890123"
                        className="ref-input"
                        value={gcashRef}
                        onChange={(e) => setGcashRef(e.target.value)}
                      />
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
                      {gcashReceipt && <span>{gcashReceipt.name}</span>}
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
                {isSubmitting ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;
