import React from 'react';
import "../../styles/owners/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* ==== TOP CARDS ==== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p>Total Tenants</p>
            <h2>2</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <p>Vacant Units</p>
            <h2>3</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <p>Pending Bills</p>
            <h2>1</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <p>Monthly Income</p>
            <h2>₱15,000</h2>
          </div>
        </div>
      </div>

      {/* ==== TABLE SECTIONS ==== */}
      <div className="table-section">
        <div className="data-card">
          <h3>Pending Applications</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td>Juan Dela Cruz</td>
                  <td>House 2</td>
                  <td>
                    <button className="view-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="data-card">
          <h3>Recent Invoices</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Invoice No.</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td>Juan Dela Cruz</td>
                  <td>2025-09-0{i}</td>
                  <td>P25090{i}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;