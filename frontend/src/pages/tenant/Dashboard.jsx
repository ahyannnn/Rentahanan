import React from "react";
// Import Lucide icons
import { DollarSign, Calendar, CreditCard } from "lucide-react";
import "../../styles/tenant/Dashboard.css";

const Dashboard = () => {
  const billsData = [
    { billType: "Rent", amount: "₱5,000", dueDate: "01-01-0001", status: "Unpaid", action: "Pay Now" },
    { billType: "Utilities", amount: "₱5,000", dueDate: "01-01-0001", status: "Paid", action: "Receipt" },
    { billType: "Utilities", amount: "₱5,000", dueDate: "01-01-0001", status: "Pending", action: "View" },
  ];

  const transactionData = [
    { month: "Jun", amount: "₱6.4K" },
    { month: "Aug", amount: "₱5.5K" },
    { month: "Sep", amount: "₱5.5K" },
  ];

  // Helper function to get the appropriate icon for the card
  const getCardIcon = (title) => {
    switch (title) {
      case "Current Bills":
        return <DollarSign size={24} />;
      case "Due Date":
        return <Calendar size={24} />;
      case "Balance":
        return <CreditCard size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="welcome-header">
        <p>
          Welcome back, <span>Juan!</span>
        </p>
        <div className="unit-lease-info">
          <span>Unit: 1</span>
          <span>Lease: Since Jan 01, 2001</span>
        </div>
      </div>

      {/* Overview Cards (ENHANCED with Lucide Icons) */}
      <div className="bills-overview-cards">
        {/* Card 1: Current Bills (Blue Card) */}
        <div className="card blue-card">
          <div className="card-header">
            <p>Current Bills</p>
            {getCardIcon("Current Bills")}
          </div>
          <h2>2</h2>
        </div>

        {/* Card 2: Due Date (Yellow Card) */}
        <div className="card yellow-card">
          <div className="card-header">
            <p>Due Date</p>
            {getCardIcon("Due Date")}
          </div>
          <h2>01-01-0001</h2>
        </div>

        {/* Card 3: Balance (Red Card) */}
        <div className="card red-card">
          <div className="card-header">
            <p>Balance</p>
            {getCardIcon("Balance")}
          </div>
          <h2>₱0.00</h2>
        </div>
      </div>

      {/* Current Bills Table */}
      <div className="current-bills-section">
        <h3>Current Bills</h3>
        <table className="bills-table">
          <thead>
            <tr>
              <th>Bill Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className="action-header">Action</th> {/* Added class for alignment */}
            </tr>
          </thead>
          <tbody>
            {billsData.map((bill, index) => (
              <tr key={index}>
                <td data-label="Bill Type">{bill.billType}</td>
                <td data-label="Amount">{bill.amount}</td>
                <td data-label="Due Date">{bill.dueDate}</td>
                {/* TASK 1: Removed the class for coloring the status cell */}
                <td data-label="Status">
                  {bill.status}
                </td>
                {/* TASK 2: Added class for aligning the button/link */}
                <td data-label="Action" className="action-cell">
                  <a
                    href="#"
                    className={`action-link action-${bill.action
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {bill.action}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Overview */}
      <div className="transaction-overview-section">
        {/* ... (Transaction Overview remains unchanged) ... */}
        <h3>Transaction Overview</h3>
        <div className="chart-container">
          {transactionData.map((data, index) => (
            <div key={index} className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{
                  height: data.amount.includes("6.4K") ? "100px" : "90px",
                }}
              ></div>
              <p>
                {data.month} {data.amount.replace("₱", "")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;