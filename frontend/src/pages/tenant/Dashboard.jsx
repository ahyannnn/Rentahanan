import React from "react";
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

      {/* Overview Cards */}
      <div className="bills-overview-cards">
        <div className="card blue-card">
          <p>Current Bills</p>
          <h2>2</h2>
        </div>
        <div className="card yellow-card">
          <p>Due Date</p>
          <h2>01-01-0001</h2>
        </div>
        <div className="card red-card">
          <p>Balance</p>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {billsData.map((bill, index) => (
              <tr key={index}>
                <td data-label="Bill Type">{bill.billType}</td>
                <td data-label="Amount">{bill.amount}</td>
                <td data-label="Due Date">{bill.dueDate}</td>
                <td data-label="Status" className={`status-${bill.status.toLowerCase()}`}>
                  {bill.status}
                </td>
                <td data-label="Action">
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
