import React, { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import "../../styles/owners/Transactions.css";

function Transactions() {
  const [activeTab, setActiveTab] = useState("Application");

  return (
    <div className="transactions-page-container">
      {/* --- Header Card --- */}
      <div className="content-card">
        <h2>Transaction History</h2>
        <p>Track all rental payments and pending applications in one place.</p>
      </div>

      {/* --- Main Transaction Area --- */}
      <div className="content-card transaction-area">
        {/* Tabs and Search */}
        <div className="transaction-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-item ${activeTab === "Active" ? "active" : ""}`}
              onClick={() => setActiveTab("Active")}
            >
              Active
            </button>
            <button
              className={`tab-item ${activeTab === "Application" ? "active" : ""}`}
              onClick={() => setActiveTab("Application")}
            >
              Application
            </button>
          </div>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search transactions..." />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="transaction-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Trans. ID</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Bill Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Ref No.</th>
                <th>Proof</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {/* --- Sample Row 1 (Pending / Application) --- */}
              <tr className="pending-row">
                <td>00001</td>
                <td>Juan Dela Cruz</td>
                <td>1</td>
                <td>Deposit & Advance</td>
                <td>Gcash</td>
                <td>₱ 5,000</td>
                <td>123...</td>
                <td className="proof-link">View</td>
                <td>01-01-2025</td>
                <td><span className="status pending">Pending</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-approve">
                      <CheckCircle size={18} />
                    </button>
                    <button className="action-reject">
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* --- Sample Row 2 (Approved / Active) --- */}
              <tr>
                <td>00002</td>
                <td>Maria Santos</td>
                <td>2</td>
                <td>Monthly Rent</td>
                <td>Bank Transfer</td>
                <td>₱ 15,000</td>
                <td>543...</td>
                <td className="proof-link">View</td>
                <td>01-02-2025</td>
                <td><span className="status approved">Approved</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-approve">
                      <CheckCircle size={18} />
                    </button>
                    <button className="action-reject">
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
