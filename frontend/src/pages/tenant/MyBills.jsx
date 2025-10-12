import React, { useState } from "react";
import "../../styles/tenant/MyBills.css";

const MyBills = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const staticBills = [
    { id: 1, billType: "Rent (Sep)", amount: "P5000", rawAmount: 5000, dueDate: "01-01-0001", status: "Unpaid", action: "Pay Now" },
    { id: 2, billType: "Utilities (Sep)", amount: "P500", rawAmount: 500, dueDate: "01-01-0001", status: "Unpaid", action: "Pay Now" },
    { id: 3, billType: "Utilities (Aug)", amount: "P 5,000", rawAmount: 5000, dueDate: "01-01-0001", status: "Paid", action: "Receipt" },
  ];
  
  const selectedBillsData = [
    { id: 1, name: "#0001 Rent (Sep)", amount: "P5000" },
    { id: 2, name: "#0001 Utilities (Sep)", amount: "P500" },
  ];
  const totalAmount = "P5500";
  
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
            {staticBills.map((bill, index) => (
              <tr key={index} className={`row-${bill.status.toLowerCase()}`}>
                <td data-label="Bill Type" className="bill-type-combined">
                    <input type="checkbox" className="bill-checkbox" defaultChecked={bill.status === "Unpaid"} />
                    <span className="bill-type-label">{bill.billType}</span>
                </td>
                <td data-label="Amount">{bill.amount}</td>
                <td data-label="Due Date">{bill.dueDate}</td>
                <td data-label="Status" className={`status-${bill.status.toLowerCase()}`}>{bill.status}</td>
                <td data-label="Action">
                  <a href="#" className={`action-link action-${bill.action.toLowerCase().replace(" ", "-")}`}>
                    {bill.action}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-actions">
        <div className="total-selected">
          <strong>Total Selected:</strong> <span>{totalAmount}</span>
        </div>
        <button className="proceed-btn" onClick={handleOpenModal}>Proceed to Payment</button>
      </div>

      <div className="summary-section">
        <h3>Summary</h3>
        <div className="summary-cards">
          <div className="summary-card unpaid">
            <p>Total Unpaid</p>
            <h4>P8,000</h4>
          </div>
          <div className="summary-card pending">
            <p>Total Pending</p>
            <h4>P500</h4>
          </div>
          <div className="summary-card due">
            <p>Next Due</p>
            <h4>Oct 30</h4>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="payments-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
                <button className="back-btn" onClick={handleCloseModal}>&lt;</button>
                <h3>Payments</h3>
            </div>

            <div className="modal-content">
                
                <div className="bill-summary">
                    <p><strong>Selected Bills:</strong></p>
                    <div className="bill-list">
                        {selectedBillsData.map((bill) => (
                            <div key={bill.id} className="bill-item">
                                <span>{bill.name}</span>
                                <span>{bill.amount}</span>
                            </div>
                        ))}
                    </div>
                    <div className="total-amount-row">
                        <span>Total Amount:</span>
                        <strong>{totalAmount}</strong>
                    </div>
                </div>

                <div className="payment-method-section">
                    <p><strong>Payment Method:</strong></p>
                    
                    <label className="radio-option">
                        <input type="radio" name="payment-method" value="cash" defaultChecked />
                        <span>Cash</span>
                        <div className="detail-text">
                            Prepare P50000<br/>Owner will validate
                        </div>
                    </label>

                    <label className="radio-option">
                        <input type="radio" name="payment-method" value="gcash" />
                        <span>Gcash</span>
                        <div className="detail-text">
                            Send **P50000** to **09876543211**<br/>
                            Ref No. <input type="text" placeholder="12345..." className="ref-input"/>
                            <div className="upload-proof">
                                Upload Proof:
                                <label className="choose-file-btn">
                                    Choose File
                                    <input type="file" style={{display: 'none'}} />
                                </label>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            
            <div className="modal-footer">
                <button className="submit-btn">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;