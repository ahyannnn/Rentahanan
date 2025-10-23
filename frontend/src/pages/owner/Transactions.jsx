import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, Search } from "lucide-react";
import "../../styles/owners/Transactions.css";

function Transactions() {
  const [activeTab, setActiveTab] = useState("all");
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/billing/bills");
        const data = await res.json();
        setBills(data);
      } catch (err) {
        console.error("Error fetching bills:", err);
      }
    };
    fetchBills();
  }, []);

  // Filter bills by tab and search term
  const filteredBills = bills
    .filter((b) => {
      if (activeTab === "unpaid") return b.status === "Unpaid";
      if (activeTab === "for_validation") return b.status === "For Validation";
      if (activeTab === "paid") return b.status === "Paid";
      return true; // all
    })
    .filter((b) =>
      b.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Approve and issue receipt
  const handleApprove = async (billid) => {
    if (!window.confirm("Approve this payment and issue receipt?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/transactions/issue-receipt/${billid}`,
        { method: "POST" }
      );
      if (res.ok) {
        alert("Receipt issued!");
        setBills((prev) =>
          prev.map((b) =>
            b.billid === billid ? { ...b, status: "paid" } : b
          )
        );
      } else {
        alert("Failed to issue receipt.");
      }
    } catch (err) {
      console.error(err);
    }
  };
const handleIssueReceipt = async (billid) => {
  if (!window.confirm("Approve this payment and issue receipt?")) return;

  // Optimistically update the status to "Paid" (optional)
  const prevBills = [...bills];
  setBills((prev) =>
    prev.map((b) =>
      b.billid === billid ? { ...b, status: "Paid" } : b
    )
  );

  try {
    const res = await fetch(
      `http://localhost:5000/api/transactions/issue-receipt/${billid}`,
      { method: "POST" }
    );

    if (res.ok) {
      const data = await res.json();
      alert("Receipt issued!");

      // Update receipt filename in the state
      setBills((prev) =>
        prev.map((b) =>
          b.billid === billid ? { ...b, GCash_receipt: data.receipt } : b
        )
      );

      // Switch to Paid tab if needed
      setActiveTab("paid");
    } else {
      throw new Error("Failed to issue receipt");
    }
  } catch (err) {
    console.error(err);
    alert("Error issuing receipt. Rolling back status.");
    
    // Rollback to previous state
    setBills(prevBills);
  }
};


  // Reject payment
  const handleReject = async (billid) => {
    if (!window.confirm("Reject this payment?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/bills/reject/${billid}`,
        { method: "PUT" }
      );
      if (res.ok) {
        alert("Bill rejected.");
        setBills((prev) =>
          prev.map((b) =>
            b.billid === billid ? { ...b, status: "pending" } : b
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="transactions-page-container">
      <div className="content-card">
        <h2>Transaction History</h2>
        <p>Track all tenant bills by status.</p>
      </div>

      <div className="content-card transaction-area">
        {/* Tabs */}
        <div className="transaction-tabs">
          <div className="tab-buttons">
            {["all", "unpaid", "for_validation", "paid"].map((tab) => (
              <button
                key={tab}
                className={`tab-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="transaction-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Bill Type</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>Ref No.</th>
                <th>Proof</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center", padding: "10px" }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.billid}>
                    <td>{b.billid}</td>
                    <td>{b.tenant_name}</td>
                    <td>{b.unit_name}</td>
                    <td>{b.billtype}</td>
                    <td>₱ {parseFloat(b.amount).toLocaleString()}</td>
                    <td>{b.paymenttype || "-"}</td>
                    <td>{b.GCash_Ref || "-"}</td>
                    <td>
                      {b.GCash_receipt ? (
                        <a
                          href={`http://localhost:5000/uploads/gcash_receipts/${b.GCash_receipt}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{b.issuedate}</td>
                    <td>
                      <span
                        className={`status ${b.status === "paid"
                            ? "approved"
                            : b.status === "for_validation"
                              ? "pending"
                              : "rejected"
                          }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {activeTab === "for_validation" && (
                        <button
                          className="issue-receipt-btn"
                          onClick={() => handleIssueReceipt(b.billid)}
                        >
                          Issue Receipt
                        </button>
                      )}

                      {activeTab === "paid" && b.GCash_receipt && (
                        <a
                          href={`http://localhost:5000/uploads/receipts/${b.GCash_receipt}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText size={18} />
                        </a>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
