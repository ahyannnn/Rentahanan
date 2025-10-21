import React, { useState, useEffect } from "react";
import "../../styles/tenant/MyBills.css";

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [gcashRef, setGcashRef] = useState("");
  const [gcashReceipt, setGcashReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tenantId = localStorage.getItem("tenantId");

  // Fetch bills from backend
  const fetchBills = () => {
    if (!tenantId) return;
    fetch(`http://localhost:5000/api/bills/${tenantId}`)
      .then((res) => res.json())
      .then((data) => setBills(data))
      .catch((err) => console.error("Error fetching bills:", err));
  };

  useEffect(() => {
    fetchBills();
  }, [tenantId]);

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
        <p>View, manage, and keep track of your recent bills.</p>
      </div>

      <div className="top-controls">
        <input type="text" placeholder="🔍 Search bill..." className="search-input" />
        <div className="filter-tabs">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Unpaid</button>
          <button className="filter-btn">Paid</button>
          <button className="filter-btn">Pending</button>
        </div>
      </div>

      <div className="bills-table-wrapper">
        <table className="bills-table">
          <thead>
            <tr>
              <th>Bill Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
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
                        href="#"
                        className={`action-link action-${isUnpaid ? "pay-now" : "receipt"}`}
                        onClick={isUnpaid ? handleOpenModal : undefined}
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
        <div className="total-selected">
          <strong>Total Selected:</strong> <span>₱{totalAmount.toLocaleString()}</span>
        </div>
        <button className="proceed-btn" onClick={handleOpenModal} disabled={unpaidBills.length === 0}>
          Proceed to Payment
        </button>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h3>Summary</h3>
        <div className="summary-cards">
          <div className="summary-card unpaid">
            <p>Total Unpaid</p>
            <h4>₱{totalUnpaid.toLocaleString()}</h4>
          </div>
          <div className="summary-card pending">
            <p>Total Pending</p>
            <h4>₱{totalPending.toLocaleString()}</h4>
          </div>
          <div className="summary-card due">
            <p>Next Due</p>
            <h4>{nextDue}</h4>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
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
                  {unpaidBills.map((bill) => (
                    <div key={bill.billid} className="bill-item">
                      <span>#{bill.billid} - {bill.billtype}</span>
                      <span>₱{Number(bill.amount).toLocaleString()}</span>
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

                <label className="radio-option">
                  <input
                    type="radio"
                    name="payment-method"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <span>Cash</span>
                  <div className="detail-text">
                    Prepare cash payment. Owner will validate.
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="payment-method"
                    value="gcash"
                    checked={paymentMethod === "gcash"}
                    onChange={() => setPaymentMethod("gcash")}
                  />
                  <span>Gcash</span>
                  <div className="detail-text">
                    Send the total amount to the owner's GCash number.<br />
                    Ref No.:{" "}
                    <input
                      type="text"
                      placeholder="12345..."
                      className="ref-input"
                      value={gcashRef}
                      onChange={(e) => setGcashRef(e.target.value)}
                      disabled={paymentMethod !== "gcash"}
                    />
                    <div className="upload-proof">
                      Upload Proof:
                      <label className="choose-file-btn">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => setGcashReceipt(e.target.files[0])}
                          disabled={paymentMethod !== "gcash"}
                        />
                      </label>
                      {gcashReceipt && <span>{gcashReceipt.name}</span>}
                    </div>
                  </div>
                </label>
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
