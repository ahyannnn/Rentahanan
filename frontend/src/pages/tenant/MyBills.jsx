import React, { useState } from "react";
import "../../styles/tenant/MyBills.css";

const MyBills = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [gcashRef, setGcashRef] = useState("");
  const [gcashReceipt, setGcashReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);

  const sampleBills = [
    { billid: "BI01", billtype: "Water", amount: 450, duedate: "2025-10-30", status: "Unpaid" },
    { billid: "BI02", billtype: "Electricity", amount: 980, duedate: "2025-10-31", status: "Unpaid" },
    { billid: "BI03", billtype: "Rent", amount: 5000, duedate: "2025-10-25", status: "Pending" },
    { billid: "BI04", billtype: "Internet", amount: 1200, duedate: "2025-11-05", status: "Paid" },
  ];

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
      setSelectedBills([]);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert(error.message || "Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = (billId) => {
    alert(`Viewing receipt for ${billId}`);
  };

  return (
    <div className="bills-invoice-container-Tenant-Bills">
      <div className="page-header-Tenant-Bills">
        <h2 className="page-title-Tenant-Bills">My Bills & Invoices</h2>
        <p className="page-description-Tenant-Bills">View, manage, and keep track of your recent bills.</p>
      </div>

      {/* Desktop Table */}
      <div className="bills-table-wrapper-Tenant-Bills">
        <table className="bills-table-Tenant-Bills">
          <thead className="table-header-Tenant-Bills">
            <tr className="table-header-row-Tenant-Bills">
              <th className="table-heading-Tenant-Bills">Select</th>
              <th className="table-heading-Tenant-Bills">Bill ID</th>
              <th className="table-heading-Tenant-Bills">Type</th>
              <th className="table-heading-Tenant-Bills">Amount</th>
              <th className="table-heading-Tenant-Bills">Due Date</th>
              <th className="table-heading-Tenant-Bills">Status</th>
              <th className="table-heading-Tenant-Bills">Action</th>
            </tr>
          </thead>
          <tbody className="table-body-Tenant-Bills">
            {sampleBills.map((bill) => {
              const isUnpaid = bill.status.toLowerCase() === "unpaid";
              const isPending = bill.status.toLowerCase() === "pending";
              const isPaid = bill.status.toLowerCase() === "paid";
              const isSelectable = isUnpaid;
              
              return (
                <tr key={bill.billid} className="table-row-Tenant-Bills">
                  <td className="table-data-Tenant-Bills">
                    <input
                      type="checkbox"
                      className="bill-checkbox-Tenant-Bills"
                      checked={selectedBills.includes(bill.billid)}
                      onChange={(e) => {
                        if (e.target.checked && isSelectable) {
                          setSelectedBills([...selectedBills, bill.billid]);
                        } else {
                          setSelectedBills(selectedBills.filter((id) => id !== bill.billid));
                        }
                      }}
                      disabled={!isSelectable}
                    />
                  </td>
                  <td className="table-data-Tenant-Bills">{bill.billid}</td>
                  <td className="table-data-Tenant-Bills">{bill.billtype}</td>
                  <td className="table-data-Tenant-Bills">₱{bill.amount.toLocaleString()}</td>
                  <td className="table-data-Tenant-Bills">{bill.duedate}</td>
                  <td className={`table-data-Tenant-Bills status-Tenant-Bills status-${bill.status.toLowerCase()}-Tenant-Bills`}>
                    {bill.status}
                  </td>
                  <td className="table-data-Tenant-Bills action-cell-Tenant-Bills">
                    {isUnpaid ? (
                      <button className="action-btn-Tenant-Bills pay-now-btn-Tenant-Bills">
                        Pay Now
                      </button>
                    ) : isPending ? (
                      <button className="action-btn-Tenant-Bills pending-btn-Tenant-Bills" disabled>
                        For Validation
                      </button>
                    ) : (
                      <button 
                        className="action-btn-Tenant-Bills receipt-btn-Tenant-Bills"
                        onClick={() => handleViewReceipt(bill.billid)}
                      >
                        View Receipt
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-bills-container-Tenant-Bills">
        {sampleBills.map((bill) => {
          const isUnpaid = bill.status.toLowerCase() === "unpaid";
          const isPending = bill.status.toLowerCase() === "pending";
          const isPaid = bill.status.toLowerCase() === "paid";
          const isSelectable = isUnpaid;

          return (
            <div key={bill.billid} className="mobile-bill-card-Tenant-Bills">
              <div className="mobile-bill-header-Tenant-Bills">
                <span className="mobile-bill-id-Tenant-Bills">{bill.billid}</span>
                <input
                  type="checkbox"
                  className="mobile-bill-checkbox-Tenant-Bills"
                  checked={selectedBills.includes(bill.billid)}
                  onChange={(e) => {
                    if (e.target.checked && isSelectable) {
                      setSelectedBills([...selectedBills, bill.billid]);
                    } else {
                      setSelectedBills(selectedBills.filter((id) => id !== bill.billid));
                    }
                  }}
                  disabled={!isSelectable}
                />
              </div>
              <div className="mobile-bill-details-Tenant-Bills">
                <div className="mobile-bill-detail-Tenant-Bills">
                  <span className="mobile-detail-label-Tenant-Bills">Type:</span>
                  <span className="mobile-detail-value-Tenant-Bills">{bill.billtype}</span>
                </div>
                <div className="mobile-bill-detail-Tenant-Bills">
                  <span className="mobile-detail-label-Tenant-Bills">Amount:</span>
                  <span className="mobile-detail-value-Tenant-Bills mobile-bill-amount-Tenant-Bills">₱{bill.amount.toLocaleString()}</span>
                </div>
                <div className="mobile-bill-detail-Tenant-Bills">
                  <span className="mobile-detail-label-Tenant-Bills">Due Date:</span>
                  <span className="mobile-detail-value-Tenant-Bills">{bill.duedate}</span>
                </div>
                <div className="mobile-bill-detail-Tenant-Bills">
                  <span className="mobile-detail-label-Tenant-Bills">Status:</span>
                  <span className={`mobile-detail-value-Tenant-Bills status-Tenant-Bills status-${bill.status.toLowerCase()}-Tenant-Bills`}>
                    {bill.status}
                  </span>
                </div>
              </div>
              <div className="mobile-bill-footer-Tenant-Bills">
                {isUnpaid ? (
                  <button className="mobile-action-btn-Tenant-Bills pay-now-btn-Tenant-Bills">
                    Pay Now
                  </button>
                ) : isPending ? (
                  <button className="mobile-action-btn-Tenant-Bills mobile-pending-btn-Tenant-Bills" disabled>
                    For Validation
                  </button>
                ) : (
                  <button 
                    className="mobile-action-btn-Tenant-Bills mobile-receipt-btn-Tenant-Bills"
                    onClick={() => handleViewReceipt(bill.billid)}
                  >
                    View Receipt
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions-Tenant-Bills">
        <div className="payment-summary-row-Tenant-Bills">
          <div className="total-value-Tenant-Bills">
            <span className="total-label-Tenant-Bills">Total Value:</span>
            <span className="total-amount-Tenant-Bills">₱{selectedTotalAmount.toLocaleString()}</span>
          </div>
          <button
            className="proceed-btn-Tenant-Bills"
            onClick={handleOpenModal}
            disabled={selectedBills.length === 0}
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* GCASH MODAL - COMPLETE */}
      {isModalOpen && (
        <div className="modal-overlay-Tenant-Bills" onClick={handleCloseModal}>
          <div className="payments-modal-Tenant-Bills" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-Tenant-Bills">
              <button className="back-btn-Tenant-Bills" onClick={handleCloseModal}>
                &lt;
              </button>
              <h3 className="modal-title-Tenant-Bills">Payments</h3>
            </div>

            <div className="modal-content-Tenant-Bills">
              {/* Bill Summary */}
              <div className="bill-summary-Tenant-Bills">
                <p className="summary-title-Tenant-Bills">
                  <strong>Selected Bills ({selectedBills.length}):</strong>
                </p>
                <div className="bill-list-Tenant-Bills">
                  {sampleBills
                    .filter((bill) => selectedBills.includes(bill.billid))
                    .map((bill) => (
                      <div key={bill.billid} className="bill-item-Tenant-Bills">
                        <span className="bill-type-Tenant-Bills">#{bill.billid}</span>
                        <span className="bill-amount-Tenant-Bills">₱{bill.amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
                <div className="total-amount-row-Tenant-Bills">
                  <span>Total Amount:</span>
                  <strong>₱{selectedTotalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="payment-method-section-Tenant-Bills">
                <p className="method-title-Tenant-Bills">
                  <strong>Payment Method:</strong>
                </p>

                {/* Cash Option */}
                <div
                  className={`payment-card-Tenant-Bills ${paymentMethod === "cash" ? "payment-card-selected-Tenant-Bills" : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <h4 className="payment-title-Tenant-Bills">💵 Cash</h4>
                  <p className="payment-description-Tenant-Bills">Prepare cash payment. Owner will validate.</p>
                </div>

                {/* GCash Option */}
                <div
                  className={`payment-card-Tenant-Bills ${paymentMethod === "gcash" ? "payment-card-selected-Tenant-Bills" : ""}`}
                  onClick={() => setPaymentMethod("gcash")}
                >
                  <h4 className="payment-title-Tenant-Bills">📱 GCash</h4>
                  <p className="payment-description-Tenant-Bills">Send the total amount to the owner's GCash account.</p>

                  {paymentMethod === "gcash" && (
                    <div className="gcash-details-Tenant-Bills">
                      <div className="gcash-account-info-Tenant-Bills">
                        <div className="account-info-row-Tenant-Bills">
                          <span className="account-label-Tenant-Bills">Account Name:</span>
                          <span className="account-value-Tenant-Bills">Maria Dela Cruz</span>
                        </div>
                        <div className="account-info-row-Tenant-Bills">
                          <span className="account-label-Tenant-Bills">Account Number:</span>
                          <span className="account-value-Tenant-Bills">0917-XXX-XXXX</span>
                        </div>
                      </div>

                      <div className="gcash-input-row-Tenant-Bills">
                        <label className="input-label-Tenant-Bills">Ref No.:</label>
                        <input
                          type="text"
                          placeholder="1234567890123"
                          className="ref-input-Tenant-Bills"
                          value={gcashRef}
                          onChange={(e) => setGcashRef(e.target.value)}
                        />
                      </div>

                      <div className="gcash-input-row-Tenant-Bills">
                        <label className="input-label-Tenant-Bills">Upload Proof:</label>
                        <label className="file-upload-btn-Tenant-Bills">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            className="file-input-Tenant-Bills"
                            onChange={(e) => setGcashReceipt(e.target.files[0])}
                          />
                        </label>
                        {gcashReceipt && <span className="file-name-Tenant-Bills">{gcashReceipt.name}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer-Tenant-Bills">
              <button
                className="submit-btn-Tenant-Bills"
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