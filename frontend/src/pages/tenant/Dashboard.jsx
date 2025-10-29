import React from "react";
import { DollarSign, Calendar, CreditCard, TrendingUp, FileText, Download, Eye, ArrowUpRight, Bell, ChevronRight } from "lucide-react";
import "../../styles/tenant/Dashboard.css";

const Dashboard = () => {
  const billsData = [
    { 
      billType: "Rent", 
      amount: "₱5,000", 
      dueDate: "Jan 15, 2024", 
      status: "Unpaid", 
      action: "Pay Now",
      icon: <FileText size={16} />
    },
    { 
      billType: "Utilities", 
      amount: "₱2,500", 
      dueDate: "Jan 10, 2024", 
      status: "Paid", 
      action: "Receipt",
      icon: <Download size={16} />
    },
    { 
      billType: "Internet", 
      amount: "₱1,200", 
      dueDate: "Jan 12, 2024", 
      status: "Pending", 
      action: "View",
      icon: <Eye size={16} />
    },
  ];

  const transactionData = [
    { month: "Oct", amount: "₱8.2K", height: "120px" },
    { month: "Nov", amount: "₱7.8K", height: "110px" },
    { month: "Dec", amount: "₱6.4K", height: "100px" },
    { month: "Jan", amount: "₱8.5K", height: "125px" },
  ];

  const quickActions = [
    { label: "Pay Bills", icon: <DollarSign size={20} />, color: "blue" },
    { label: "View History", icon: <FileText size={20} />, color: "green" },
    { label: "Report Issue", icon: <Bell size={20} />, color: "orange" },
  ];

  const getCardIcon = (title) => {
    switch (title) {
      case "Current Bills":
        return <FileText size={24} />;
      case "Due Date":
        return <Calendar size={24} />;
      case "Balance":
        return <CreditCard size={24} />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "unpaid":
        return { class: "status-unpaid", icon: "⚠️" };
      case "paid":
        return { class: "status-paid", icon: "✅" };
      case "pending":
        return { class: "status-pending", icon: "⏳" };
      default:
        return { class: "status-default", icon: "" };
    }
  };

  return (
    <div className="dashboard-content-Tenant-Dashboard">
      {/* Header */}
      <div className="dashboard-header-Tenant-Dashboard">
        <div className="welcome-section-Tenant-Dashboard">
          <h1 className="welcome-text-Tenant-Dashboard">
            Welcome back, <span className="welcome-name-Tenant-Dashboard">Juan!</span>
          </h1>
          <p className="welcome-subtitle-Tenant-Dashboard">Here's your financial overview for today</p>
        </div>
        <div className="unit-lease-info-Tenant-Dashboard">
          <div className="info-badge-Tenant-Dashboard">
            <span className="info-label-Tenant-Dashboard">Unit</span>
            <span className="info-value-Tenant-Dashboard">A-101</span>
          </div>
          <div className="info-badge-Tenant-Dashboard">
            <span className="info-label-Tenant-Dashboard">Lease Since</span>
            <span className="info-value-Tenant-Dashboard">Jan 01, 2024</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-Tenant-Dashboard">
        {quickActions.map((action, index) => (
          <button 
            key={index} 
            className={`quick-action-btn-Tenant-Dashboard ${action.color}-action`}
          >
            <div className="action-icon-Tenant-Dashboard">
              {action.icon}
            </div>
            <span>{action.label}</span>
            <ArrowUpRight size={16} className="action-arrow-Tenant-Dashboard" />
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="bills-overview-cards-Tenant-Dashboard">
        <div className="card-Tenant-Dashboard blue-card-Tenant-Dashboard">
          <div className="card-header-Tenant-Dashboard">
            <div className="card-title-section-Tenant-Dashboard">
              <p className="card-title-Tenant-Dashboard">Current Bills</p>
              <p className="card-subtitle-Tenant-Dashboard">Pending payments</p>
            </div>
            <div className="card-icon-Tenant-Dashboard">
              {getCardIcon("Current Bills")}
            </div>
          </div>
          <h2 className="card-value-Tenant-Dashboard">2</h2>
          <div className="card-trend-Tenant-Dashboard">
            <TrendingUp size={16} />
            <span>+1 from last month</span>
          </div>
        </div>

        <div className="card-Tenant-Dashboard yellow-card-Tenant-Dashboard">
          <div className="card-header-Tenant-Dashboard">
            <div className="card-title-section-Tenant-Dashboard">
              <p className="card-title-Tenant-Dashboard">Due Date</p>
              <p className="card-subtitle-Tenant-Dashboard">Next payment</p>
            </div>
            <div className="card-icon-Tenant-Dashboard">
              {getCardIcon("Due Date")}
            </div>
          </div>
          <h2 className="card-value-Tenant-Dashboard">Jan 15</h2>
          <div className="card-trend-Tenant-Dashboard">
            <Calendar size={16} />
            <span>5 days remaining</span>
          </div>
        </div>

        <div className="card-Tenant-Dashboard green-card-Tenant-Dashboard">
          <div className="card-header-Tenant-Dashboard">
            <div className="card-title-section-Tenant-Dashboard">
              <p className="card-title-Tenant-Dashboard">Balance</p>
              <p className="card-subtitle-Tenant-Dashboard">Total outstanding</p>
            </div>
            <div className="card-icon-Tenant-Dashboard">
              {getCardIcon("Balance")}
            </div>
          </div>
          <h2 className="card-value-Tenant-Dashboard">₱5,000</h2>
          <div className="card-trend-Tenant-Dashboard positive">
            <TrendingUp size={16} />
            <span>No overdue</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid-Tenant-Dashboard">
        {/* Current Bills Table */}
        <div className="current-bills-section-Tenant-Dashboard">
          <div className="section-header-Tenant-Dashboard">
            <div className="section-title-group-Tenant-Dashboard">
              <h3 className="section-title-Tenant-Dashboard">Current Bills</h3>
              <p className="section-subtitle-Tenant-Dashboard">Manage your payments and view status</p>
            </div>
            <button className="view-all-btn-Tenant-Dashboard">
              View All
              <ChevronRight size={16} />
            </button>
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
                {billsData.map((bill, index) => {
                  const statusVariant = getStatusVariant(bill.status);
                  return (
                    <tr key={index} className="table-row-Tenant-Dashboard">
                      <td className="table-data-Tenant-Dashboard" data-label="Bill Type">
                        <div className="bill-type-cell-Tenant-Dashboard">
                          <div className="bill-icon-Tenant-Dashboard">
                            {bill.icon}
                          </div>
                          <span className="bill-type-text-Tenant-Dashboard">{bill.billType}</span>
                        </div>
                      </td>
                      <td className="table-data-Tenant-Dashboard" data-label="Amount">
                        <span className="amount-text-Tenant-Dashboard">{bill.amount}</span>
                      </td>
                      <td className="table-data-Tenant-Dashboard" data-label="Due Date">
                        <span className="due-date-text-Tenant-Dashboard">{bill.dueDate}</span>
                      </td>
                      <td className="table-data-Tenant-Dashboard" data-label="Status">
                        <span className={`status-badge-Tenant-Dashboard ${statusVariant.class}`}>
                          {statusVariant.icon} {bill.status}
                        </span>
                      </td>
                      <td className="table-data-Tenant-Dashboard action-cell-Tenant-Dashboard" data-label="Action">
                        <button
                          className={`action-btn-Tenant-Dashboard action-${bill.action.toLowerCase().replace(" ", "-")}`}
                        >
                          {bill.action}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="transaction-overview-section-Tenant-Dashboard">
          <div className="section-header-Tenant-Dashboard">
            <div className="section-title-group-Tenant-Dashboard">
              <h3 className="section-title-Tenant-Dashboard">Spending Overview</h3>
              <p className="section-subtitle-Tenant-Dashboard">Last 4 months payment history</p>
            </div>
            <div className="chart-legend-Tenant-Dashboard">
              <div className="legend-item-Tenant-Dashboard">
                <div className="legend-color-Tenant-Dashboard blue"></div>
                <span>Payments</span>
              </div>
            </div>
          </div>
          <div className="chart-container-Tenant-Dashboard">
            <div className="chart-bars-Tenant-Dashboard">
              {transactionData.map((data, index) => (
                <div key={index} className="chart-bar-wrapper-Tenant-Dashboard">
                  <div
                    className="chart-bar-Tenant-Dashboard"
                    style={{ height: data.height }}
                    data-amount={data.amount}
                  ></div>
                  <p className="chart-label-Tenant-Dashboard">
                    {data.month}
                    <span className="chart-amount-Tenant-Dashboard">{data.amount}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="chart-grid-Tenant-Dashboard">
              <div className="grid-line-Tenant-Dashboard"></div>
              <div className="grid-line-Tenant-Dashboard"></div>
              <div className="grid-line-Tenant-Dashboard"></div>
              <div className="grid-line-Tenant-Dashboard"></div>
            </div>
          </div>
          <div className="chart-stats-Tenant-Dashboard">
            <div className="stat-item-Tenant-Dashboard">
              <span className="stat-label-Tenant-Dashboard">Average Monthly</span>
              <span className="stat-value-Tenant-Dashboard">₱7,725</span>
            </div>
            <div className="stat-item-Tenant-Dashboard">
              <span className="stat-label-Tenant-Dashboard">Total Paid</span>
              <span className="stat-value-Tenant-Dashboard">₱30,900</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;