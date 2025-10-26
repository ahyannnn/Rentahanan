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

  // Get unpaid bills
  const unpaidBills = bills.filter((bill) => bill.status.toLowerCase() === "unpaid");
  const totalAmount = unpaidBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  // Calculate summary
  const totalUnpaid = bills
    .filter((bill) => bill.status.toLowerCase() === "unpaid")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const totalPending = bills
    .filter(
      (bill) =>
        bill.status.toLowerCase() === "pending" ||
        bill.status.toLowerCase() === "for validation"
    )
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const nextDue =
    bills
      .filter((bill) => bill.status.toLowerCase() === "unpaid")
      .sort((a, b) => new Date(a.duedate) - new Date(b.duedate))[0]?.duedate || "N/A";

  const handleSubmitPayment = async () => {
    if (unpaidBills.length === 0) return;

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
      for (const bill of unpaidBills) {
        const formData = new FormData();
        formData.append("paymentType", paymentMethod === "cash" ? "Cash" : "GCash");
        if (paymentMethod === "gcash") {
          formData.append("gcashRef", gcashRef);
          formData.append("gcashReceipt", gcashReceipt);
        }

        const response = await fetch(
          `http://localhost:5000/api/bills/pay/${bill.billid}`,
          {
            method: "PUT",
            body: formData, // ⬅️ must be FormData (not JSON)
          }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Payment update failed");
      }

      alert("Bills submitted for validation!");
      handleCloseModal();
      fetchBills();
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert(error.message || "Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => {
                const isUnpaid = bill.status.toLowerCase() === "unpaid";
                return (
                  <tr key={bill.billid} className={`row-${bill.status.toLowerCase()}`}>
                    <td data-label="Bill Type" className="bill-type-combined">
                      <input type="checkbox" className="bill-checkbox" defaultChecked={isUnpaid} />
                      <span className="bill-type-label">{bill.billtype}</span>
                    </td>
                    <td data-label="Amount">₱{Number(bill.amount).toLocaleString()}</td>
                    <td data-label="Due Date">{bill.duedate}</td>
                    <td data-label="Status" className={`status-${bill.status.toLowerCase()}`}>
                      {bill.status}
                    </td>
                    <td data-label="Action">
                      <a
                        href={
                          !isUnpaid && bill.GCash_receipt
                            ? `http://localhost:5000/uploads/gcash_receipts/${b.GCash_receipt}`
                            : "#"
                        }
                        className={`action-link action-${isUnpaid ? "pay-now" : "receipt"}`}
                        onClick={isUnpaid ? handleOpenModal : undefined}
                        target={!isUnpaid ? "_blank" : undefined} // ✅ open receipt in new tab
                        rel="noopener noreferrer"
                      >
                        {isUnpaid ? "Pay Now" : "Receipt"}
                      </a>

                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
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