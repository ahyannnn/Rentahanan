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
    <div className="dashboard-content-Tenant-Dashboard">
      {/* Header */}
      <div className="welcome-header-Tenant-Dashboard">
        <p className="welcome-text-Tenant-Dashboard">
          Welcome back, <span className="welcome-name-Tenant-Dashboard">Juan!</span>
        </p>
        <div className="unit-lease-info-Tenant-Dashboard">
          <span className="unit-info-Tenant-Dashboard">Unit: 1</span>
          <span className="lease-info-Tenant-Dashboard">Lease: Since Jan 01, 2001</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="bills-overview-cards-Tenant-Dashboard">
        {/* Card 1: Current Bills (Blue Card) */}
        <div className="card-Tenant-Dashboard blue-card-Tenant-Dashboard">
          <div className="card-header-Tenant-Dashboard">
            <p className="card-title-Tenant-Dashboard">Current Bills</p>
            <div className="card-icon-Tenant-Dashboard">
              {getCardIcon("Current Bills")}
            </div>
          </div>
          <h2 className="card-value-Tenant-Dashboard">2</h2>
        </div>

        {/* Card 2: Due Date (Yellow Card) */}
        <div className="card-Tenant-Dashboard yellow-card-Tenant-Dashboard">
          <div className="card-header-Tenant-Dashboard">
            <p className="card-title-Tenant-Dashboard">Due Date</p>
            <div className="card-icon-Tenant-Dashboard">
              {getCardIcon("Due Date")}
            </div>
          </div>
          <h2 className="card-value-Tenant-Dashboard">01-01-0001</h2>
        </div>

        {/* Card 3: Balance (Red Card) */}
        <div className="card-Tenant-Dashboard red-card-Tenant-Dashboard">
          <div className="card-header-Tenant-Dashboard">
            <p className="card-title-Tenant-Dashboard">Balance</p>
            <div className="card-icon-Tenant-Dashboard">
              {getCardIcon("Balance")}
            </div>
          </div>
          <h2 className="card-value-Tenant-Dashboard">₱0.00</h2>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid-Tenant-Dashboard">
        {/* Current Bills Table */}
        <div className="current-bills-section-Tenant-Dashboard">
          <div className="section-header-Tenant-Dashboard">
            <h3 className="section-title-Tenant-Dashboard">Current Bills</h3>
          </div>
          <div className="table-container-Tenant-Dashboard">
            <table className="bills-table-Tenant-Dashboard">
              <thead className="table-header-Tenant-Dashboard">
                <tr className="table-header-row-Tenant-Dashboard">
                  <th className="table-heading-Tenant-Dashboard">Bill Type</th>
                  <th className="table-heading-Tenant-Dashboard">Amount</th>
                  <th className="table-heading-Tenant-Dashboard">Due Date</th>
                  <th className="table-heading-Tenant-Dashboard">Status</th>
                  <th className="table-heading-Tenant-Dashboard action-heading-Tenant-Dashboard">Action</th>
                </tr>
              </thead>
              <tbody className="table-body-Tenant-Dashboard">
                {billsData.map((bill, index) => (
                  <tr key={index} className="table-row-Tenant-Dashboard">
                    <td className="table-data-Tenant-Dashboard" data-label="Bill Type">
                      <span className="bill-type-text-Tenant-Dashboard">{bill.billType}</span>
                    </td>
                    <td className="table-data-Tenant-Dashboard" data-label="Amount">
                      <span className="amount-text-Tenant-Dashboard">{bill.amount}</span>
                    </td>
                    <td className="table-data-Tenant-Dashboard" data-label="Due Date">
                      <span className="due-date-text-Tenant-Dashboard">{bill.dueDate}</span>
                    </td>
                    <td className="table-data-Tenant-Dashboard" data-label="Status">
                      <span className={`status-text-Tenant-Dashboard status-${bill.status.toLowerCase()}-Tenant-Dashboard`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="table-data-Tenant-Dashboard action-cell-Tenant-Dashboard" data-label="Action">
                      <a
                        href="#"
                        className={`action-link-Tenant-Dashboard action-${bill.action
                          .toLowerCase()
                          .replace(" ", "-")}-Tenant-Dashboard`}
                      >
                        {bill.action}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="transaction-overview-section-Tenant-Dashboard">
          <div className="section-header-Tenant-Dashboard">
            <h3 className="section-title-Tenant-Dashboard">Transaction Overview</h3>
          </div>
          <div className="chart-container-Tenant-Dashboard">
            {transactionData.map((data, index) => (
              <div key={index} className="chart-bar-wrapper-Tenant-Dashboard">
                <div
                  className="chart-bar-Tenant-Dashboard"
                  style={{
                    height: data.amount.includes("6.4K") ? "100px" : "90px",
                  }}
                ></div>
                <p className="chart-label-Tenant-Dashboard">
                  {data.month} <span className="chart-amount-Tenant-Dashboard">{data.amount.replace("₱", "")}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;