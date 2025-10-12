import React from "react";
// Pinalitan ang import file name para tumugma sa bagong CSS file
import "../../styles/tenant/Payment.css";

const Payment = () => {
    const paymentHistory = [
        { id: 1, billType: "Rent", status: "PAID", date: "01-01-0001", amount: "P5,000" },
        { id: 2, billType: "Utilities", status: "PAID", date: "01-01-0001", amount: "P5,000" },
        { id: 3, billType: "Rent", status: "PAID", date: "01-01-0001", amount: "P5,000" },
        { id: 4, billType: "Utilities", status: "PAID", date: "01-01-0001", amount: "P5,000" },
        { id: 5, billType: "Rent", status: "PAID", date: "01-01-0001", amount: "P5,000" },
        { id: 6, billType: "Utilities", status: "PAID", date: "01-01-0001", amount: "P5,000" },
    ];

    return (
        <div className="bills-invoice-container payment-history-container">
            <div className="page-header">
                <h2>Payment History</h2>
                <p>View all your past successful and pending payment records.</p>
            </div>

            <div className="top-controls">
                <input type="text" placeholder="🔍 Search payment record..." className="search-input" />
                <div className="filter-tabs">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Success</button>
                    <button className="filter-btn">Pending</button>
                    <button className="filter-btn">Cancelled</button>
                </div>
            </div>

            <div className="payment-cards-grid">
                {paymentHistory.map(payment => (
                    <div key={payment.id} className="payment-card">
                        <div className="card-header">
                            <span className="card-bill-type">Bills - {payment.billType.toUpperCase()}</span>
                            <span className="card-status status-paid">{payment.status}</span>
                            <span className="arrow-icon">&gt;</span>
                        </div>
                        <div className="card-details">
                            <div className="detail-item">
                                <span className="detail-label">Payment Date</span>
                                <span className="detail-value date-icon">📅 {payment.date}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Amount:</span>
                                <span className="detail-value amount-text">{payment.amount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Payment;