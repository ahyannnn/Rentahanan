import React, { useState } from "react";
import { CreditCard, DollarSign, Upload, CheckCircle, Clock, AlertCircle, ChevronLeft, Search, Filter } from "lucide-react";
import "../../styles/tenant/MyBills.css";

const MyBills = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [gcashRef, setGcashRef] = useState("");
  const [gcashReceipt, setGcashReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const sampleBills = [
    { 
      billid: "BI01", 
      billtype: "Water", 
      amount: 450, 
      duedate: "2025-10-30", 
      status: "Unpaid",
      category: "Utilities"
    },
    { 
      billid: "BI02", 
      billtype: "Electricity", 
      amount: 980, 
      duedate: "2025-10-31", 
      status: "Unpaid",
      category: "Utilities"
    },
    { 
      billid: "BI03", 
      billtype: "Rent", 
      amount: 5000, 
      duedate: "2025-10-25", 
      status: "Pending",
      category: "Rent"
    },
    { 
      billid: "BI04", 
      billtype: "Internet", 
      amount: 1200, 
      duedate: "2025-11-05", 
      status: "Paid",
      category: "Utilities"
    },
  ];

  const filteredBills = sampleBills.filter(bill => {
    const matchesSearch = bill.billid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.billtype.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "unpaid":
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "rent":
        return "category-rent";
      case "utilities":
        return "category-utilities";
      default:
        return "category-other";
    }
  };

  return (
    <div className="bills-invoice-container-Tenant-Bills">
      {/* Header Section */}
      <div className="bills-header-Tenant-Bills">
        <div className="header-content-Tenant-Bills">
          <h1 className="page-title-Tenant-Bills">My Bills & Invoices</h1>
          <p className="page-description-Tenant-Bills">View, manage, and pay your bills in one place</p>
        </div>
        <div className="header-stats-Tenant-Bills">
          <div className="stat-card-Tenant-Bills">
            <div className="stat-icon-Tenant-Bills unpaid">
              <AlertCircle size={20} />
            </div>
            <div className="stat-info-Tenant-Bills">
              <span className="stat-number-Tenant-Bills">{sampleBills.filter(b => b.status === "Unpaid").length}</span>
              <span className="stat-label-Tenant-Bills">Unpaid</span>
            </div>
          </div>
          <div className="stat-card-Tenant-Bills">
            <div className="stat-icon-Tenant-Bills pending">
              <Clock size={20} />
            </div>
            <div className="stat-info-Tenant-Bills">
              <span className="stat-number-Tenant-Bills">{sampleBills.filter(b => b.status === "Pending").length}</span>
              <span className="stat-label-Tenant-Bills">Pending</span>
            </div>
          </div>
          <div className="stat-card-Tenant-Bills">
            <div className="stat-icon-Tenant-Bills paid">
              <CheckCircle size={20} />
            </div>
            <div className="stat-info-Tenant-Bills">
              <span className="stat-number-Tenant-Bills">{sampleBills.filter(b => b.status === "Paid").length}</span>
              <span className="stat-label-Tenant-Bills">Paid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bills-controls-Tenant-Bills">
        <div className="search-container-Tenant-Bills">
          <Search size={20} className="search-icon-Tenant-Bills" />
          <input 
            type="text" 
            placeholder="Search bills..." 
            className="search-input-Tenant-Bills"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls-Tenant-Bills">
          <div className="filter-tabs-Tenant-Bills">
            <button 
              className={`filter-btn-Tenant-Bills ${statusFilter === "all" ? "filter-btn-active-Tenant-Bills" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All Bills
            </button>
            <button 
              className={`filter-btn-Tenant-Bills ${statusFilter === "unpaid" ? "filter-btn-active-Tenant-Bills" : ""}`}
              onClick={() => setStatusFilter("unpaid")}
            >
              Unpaid
            </button>
            <button 
              className={`filter-btn-Tenant-Bills ${statusFilter === "pending" ? "filter-btn-active-Tenant-Bills" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
            <button 
              className={`filter-btn-Tenant-Bills ${statusFilter === "paid" ? "filter-btn-active-Tenant-Bills" : ""}`}
              onClick={() => setStatusFilter("paid")}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bills-table-wrapper-Tenant-Bills">
        <table className="bills-table-Tenant-Bills">
          <thead className="table-header-Tenant-Bills">
            <tr className="table-header-row-Tenant-Bills">
              <th className="table-heading-Tenant-Bills">Select</th>
              <th className="table-heading-Tenant-Bills">Bill ID</th>
              <th className="table-heading-Tenant-Bills">Category</th>
              <th className="table-heading-Tenant-Bills">Type</th>
              <th className="table-heading-Tenant-Bills">Amount</th>
              <th className="table-heading-Tenant-Bills">Due Date</th>
              <th className="table-heading-Tenant-Bills">Status</th>
              <th className="table-heading-Tenant-Bills">Action</th>
            </tr>
          </thead>
          <tbody className="table-body-Tenant-Bills">
            {filteredBills.map((bill) => {
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
                  <td className="table-data-Tenant-Bills bill-id-Tenant-Bills">
                    {bill.billid}
                  </td>
                  <td className="table-data-Tenant-Bills">
                    <span className={`category-badge-Tenant-Bills ${getCategoryColor(bill.category)}`}>
                      {bill.category}
                    </span>
                  </td>
                  <td className="table-data-Tenant-Bills bill-type-Tenant-Bills">
                    {bill.billtype}
                  </td>
                  <td className="table-data-Tenant-Bills bill-amount-Tenant-Bills">
                    ₱{bill.amount.toLocaleString()}
                  </td>
                  <td className="table-data-Tenant-Bills due-date-Tenant-Bills">
                    {bill.duedate}
                  </td>
                  <td className="table-data-Tenant-Bills">
                    <span className={`status-badge-Tenant-Bills status-${bill.status.toLowerCase()}`}>
                      {getStatusIcon(bill.status)}
                      {bill.status}
                    </span>
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
        {filteredBills.map((bill) => {
          const isUnpaid = bill.status.toLowerCase() === "unpaid";
          const isPending = bill.status.toLowerCase() === "pending";
          const isPaid = bill.status.toLowerCase() === "paid";
          const isSelectable = isUnpaid;

          return (
            <div key={bill.billid} className="mobile-bill-card-Tenant-Bills">
              <div className="mobile-bill-header-Tenant-Bills">
                <div className="mobile-bill-info-Tenant-Bills">
                  <span className="mobile-bill-id-Tenant-Bills">{bill.billid}</span>
                  <span className={`mobile-category-badge-Tenant-Bills ${getCategoryColor(bill.category)}`}>
                    {bill.category}
                  </span>
                </div>
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
              <div className="mobile-bill-content-Tenant-Bills">
                <div className="mobile-bill-main-Tenant-Bills">
                  <h4 className="mobile-bill-type-Tenant-Bills">{bill.billtype}</h4>
                  <span className="mobile-bill-amount-Tenant-Bills">₱{bill.amount.toLocaleString()}</span>
                </div>
                <div className="mobile-bill-details-Tenant-Bills">
                  <div className="mobile-bill-detail-Tenant-Bills">
                    <span className="mobile-detail-label-Tenant-Bills">Due Date</span>
                    <span className="mobile-detail-value-Tenant-Bills">{bill.duedate}</span>
                  </div>
                  <div className="mobile-bill-detail-Tenant-Bills">
                    <span className="mobile-detail-label-Tenant-Bills">Status</span>
                    <span className={`mobile-status-badge-Tenant-Bills status-${bill.status.toLowerCase()}`}>
                      {getStatusIcon(bill.status)}
                      {bill.status}
                    </span>
                  </div>
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
      {selectedBills.length > 0 && (
        <div className="bottom-actions-Tenant-Bills">
          <div className="payment-summary-Tenant-Bills">
            <div className="selected-bills-info-Tenant-Bills">
              <span className="selected-count-Tenant-Bills">
                {selectedBills.length} bill{selectedBills.length > 1 ? 's' : ''} selected
              </span>
              <span className="total-amount-Tenant-Bills">₱{selectedTotalAmount.toLocaleString()}</span>
            </div>
            <button
              className="proceed-btn-Tenant-Bills"
              onClick={handleOpenModal}
            >
              <CreditCard size={20} />
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay-Tenant-Bills" onClick={handleCloseModal}>
          <div className="payments-modal-Tenant-Bills" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-Tenant-Bills">
              <button className="back-btn-Tenant-Bills" onClick={handleCloseModal}>
                <ChevronLeft size={24} />
              </button>
              <h3 className="modal-title-Tenant-Bills">Payment Method</h3>
              <div className="modal-header-spacer-Tenant-Bills"></div>
            </div>

            <div className="modal-content-Tenant-Bills">
              {/* Bill Summary */}
              <div className="bill-summary-Tenant-Bills">
                <h4 className="summary-title-Tenant-Bills">Selected Bills</h4>
                <div className="bill-list-Tenant-Bills">
                  {sampleBills
                    .filter((bill) => selectedBills.includes(bill.billid))
                    .map((bill) => (
                      <div key={bill.billid} className="bill-item-Tenant-Bills">
                        <div className="bill-info-Tenant-Bills">
                          <span className="bill-id-Tenant-Bills">#{bill.billid}</span>
                          <span className="bill-type-Tenant-Bills">{bill.billtype}</span>
                        </div>
                        <span className="bill-amount-Tenant-Bills">₱{bill.amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
                <div className="total-amount-section-Tenant-Bills">
                  <span className="total-label-Tenant-Bills">Total Amount Due</span>
                  <span className="total-amount-value-Tenant-Bills">₱{selectedTotalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment-methods-Tenant-Bills">
                <h4 className="methods-title-Tenant-Bills">Choose Payment Method</h4>
                
                {/* Cash Option */}
                <div
                  className={`payment-method-card-Tenant-Bills ${paymentMethod === "cash" ? "method-selected-Tenant-Bills" : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <div className="method-header-Tenant-Bills">
                    <div className="method-icon-Tenant-Bills cash">
                      <DollarSign size={24} />
                    </div>
                    <div className="method-info-Tenant-Bills">
                      <h5 className="method-title-Tenant-Bills">Cash Payment</h5>
                      <p className="method-description-Tenant-Bills">Pay with cash directly to the owner</p>
                    </div>
                    <div className={`method-radio-Tenant-Bills ${paymentMethod === "cash" ? "radio-selected-Tenant-Bills" : ""}`}></div>
                  </div>
                </div>

                {/* GCash Option */}
                <div
                  className={`payment-method-card-Tenant-Bills ${paymentMethod === "gcash" ? "method-selected-Tenant-Bills" : ""}`}
                  onClick={() => setPaymentMethod("gcash")}
                >
                  <div className="method-header-Tenant-Bills">
                    <div className="method-icon-Tenant-Bills gcash">
                      <CreditCard size={24} />
                    </div>
                    <div className="method-info-Tenant-Bills">
                      <h5 className="method-title-Tenant-Bills">GCash</h5>
                      <p className="method-description-Tenant-Bills">Pay via GCash mobile wallet</p>
                    </div>
                    <div className={`method-radio-Tenant-Bills ${paymentMethod === "gcash" ? "radio-selected-Tenant-Bills" : ""}`}></div>
                  </div>

                  {paymentMethod === "gcash" && (
                    <div className="gcash-details-Tenant-Bills">
                      <div className="gcash-instructions-Tenant-Bills">
                        <p>Send the payment to the following account:</p>
                        <div className="account-details-Tenant-Bills">
                          <div className="account-detail-Tenant-Bills">
                            <span className="detail-label-Tenant-Bills">Account Name:</span>
                            <span className="detail-value-Tenant-Bills">Maria Dela Cruz</span>
                          </div>
                          <div className="account-detail-Tenant-Bills">
                            <span className="detail-label-Tenant-Bills">Mobile Number:</span>
                            <span className="detail-value-Tenant-Bills">0917-XXX-XXXX</span>
                          </div>
                        </div>
                      </div>

                      <div className="gcash-form-Tenant-Bills">
                        <div className="form-group-Tenant-Bills">
                          <label className="form-label-Tenant-Bills">GCash Reference Number *</label>
                          <input
                            type="text"
                            placeholder="Enter 13-digit reference number"
                            className="form-input-Tenant-Bills"
                            value={gcashRef}
                            onChange={(e) => setGcashRef(e.target.value)}
                            maxLength={13}
                          />
                        </div>

                        <div className="form-group-Tenant-Bills">
                          <label className="form-label-Tenant-Bills">Upload Receipt *</label>
                          <div className="file-upload-area-Tenant-Bills">
                            <Upload size={20} className="upload-icon-Tenant-Bills" />
                            <div className="upload-text-Tenant-Bills">
                              <p>Click to upload receipt screenshot</p>
                              <span>PNG, JPG up to 5MB</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="file-input-Tenant-Bills"
                              onChange={(e) => setGcashReceipt(e.target.files[0])}
                            />
                            {gcashReceipt && (
                              <span className="file-name-Tenant-Bills">{gcashReceipt.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer-Tenant-Bills">
              <button
                className="submit-payment-btn-Tenant-Bills"
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner-Tenant-Bills"></div>
                    Processing Payment...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;