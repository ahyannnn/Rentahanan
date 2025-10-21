import React from "react";
import {
  Users,
  Home,
  FileWarning,
  Wallet,
} from "lucide-react"; // professional icons
import "../../styles/owners/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* ==== TOP CARDS ==== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={34} />
          </div>
          <div className="stat-info">
            <p>Total Tenants</p>
            <h2>2</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Home size={34} />
          </div>
          <div className="stat-info">
            <p>Vacant Units</p>
            <h2>3</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <FileWarning size={34} />
          </div>
          <div className="stat-info">
            <p>Pending Bills</p>
            <h2>1</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">
            <Wallet size={34} />
          </div>
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
          <table className="data-table uniform-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Name</th>
                <th style={{ width: "40%" }}>Unit</th>
                <th style={{ width: "20%" }}>Action</th>
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
          <table className="data-table uniform-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Name</th>
                <th style={{ width: "40%" }}>Date</th>
                <th style={{ width: "20%" }}>Invoice No.</th>
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
