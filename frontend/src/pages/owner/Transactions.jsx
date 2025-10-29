import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, Search, Download, Eye } from "lucide-react";
import "../../styles/owners/Transactions.css";

function Transactions() {
  const [activeTab, setActiveTab] = useState("all");
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:5000/api/billing/bills");
        const data = await res.json();
        setBills(data);
      } catch (err) {
        console.error("Error fetching bills:", err);
      } finally {
        setIsLoading(false);
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

  const handleIssueReceipt = async (billid) => {
    if (!window.confirm("Approve this payment and issue receipt?")) return;

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

        setBills((prev) =>
          prev.map((b) =>
            b.billid === billid ? { ...b, GCash_receipt: data.receipt } : b
          )
        );

        setActiveTab("paid");
      } else {
        throw new Error("Failed to issue receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Error issuing receipt. Rolling back status.");
      setBills(prevBills);
    }
  };

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
            b.billid === billid ? { ...b, status: "Unpaid" } : b
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewReceipt = async (billId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/receipt/${billId}`);
      const receiptData = await response.json();

      if (response.ok && receiptData.receiptUrl) {
        // Construct the URL using your existing uploads route
        const receiptFullUrl = `http://localhost:5000/uploads/receipts/${receiptData.receiptUrl}`;
        window.open(receiptFullUrl, '_blank');
      } else {
        alert(receiptData.error || `No receipt available for bill ${billId}`);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Error loading receipt. Please try again.');
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return { class: "status-approved", label: "Paid" };
      case "for validation":
        return { class: "status-pending", label: "For Validation" };
      case "unpaid":
        return { class: "status-unpaid", label: "Unpaid" };
      default:
        return { class: "status-default", label: status };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to determine which actions to show based on bill status
  const getActionsForBill = (bill) => {
    const actions = [];
    
    if (bill.status === "For Validation") {
      actions.push(
        <button
          key="approve"
          className="action-button action-button-primary"
          onClick={() => handleIssueReceipt(bill.billid)}
        >
          <CheckCircle size={16} />
          Approve
        </button>
      );
      actions.push(
        <button
          key="reject"
          className="action-button action-button-reject"
          onClick={() => handleReject(bill.billid)}
        >
          <XCircle size={16} />
          Reject
        </button>
      );
    }
    
    if (bill.status === "Paid") {
      actions.push(
        <button
          key="view-receipt"
          className="action-button action-button-download"
          onClick={() => handleViewReceipt(bill.billid)}
        >
          <Eye size={16} />
          View Receipt
        </button>
      );
    }
    
    return actions;
  };

  return (
    <div className="owner-transactions-page-container">
      <div className="owner-transactions-header">
        <div className="owner-transactions-title-section">
          <h1>Transaction History</h1>
          <p>Track and manage all tenant bills and payments</p>
        </div>
        <div className="owner-transactions-stats">
          <div className="stat-card">
            <span className="stat-number">{bills.length}</span>
            <span className="stat-label">Total Bills</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {bills.filter(b => b.status === "Paid").length}
            </span>
            <span className="stat-label">Paid</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {bills.filter(b => b.status === "For Validation").length}
            </span>
            <span className="stat-label">For Validation</span>
          </div>
        </div>
      </div>

      <div className="owner-transactions-content-card">
        {/* Tabs and Search */}
        <div className="owner-transactions-controls">
          <div className="owner-transactions-tabs">
            {[
              { key: "all", label: "All Transactions" },
              { key: "unpaid", label: "Unpaid" },
              { key: "for_validation", label: "For Validation" },
              { key: "paid", label: "Paid" }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`owner-transactions-tab ${activeTab === tab.key ? "owner-transactions-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="owner-transactions-search">
            <Search size={18} className="owner-transactions-search-icon" />
            <input
              type="text"
              placeholder="Search by tenant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="owner-transactions-search-input"
            />
          </div>
        </div>

        {/* Table */}
        <div className="owner-transactions-table-container">
          {isLoading ? (
            <div className="owner-transactions-loading">
              <div className="loading-spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : (
            <table className="owner-transactions-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Reference</th>
                  <th>Proof</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="owner-transactions-empty">
                      <div className="empty-state">
                        <FileText size={48} className="empty-icon" />
                        <p>No transactions found</p>
                        <small>Try changing your filters or search term</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => {
                    const status = getStatusVariant(b.status);
                    return (
                      <tr key={b.billid} className="owner-transactions-row">
                        <td className="owner-transactions-bill-id">#{b.billid}</td>
                        <td className="owner-transactions-tenant">{b.tenant_name}</td>
                        <td className="owner-transactions-unit">{b.unit_name}</td>
                        <td className="owner-transactions-type">{b.billtype}</td>
                        <td className="owner-transactions-amount">
                          {formatCurrency(parseFloat(b.amount))}
                        </td>
                        <td className="owner-transactions-method">
                          {b.paymenttype || "N/A"}
                        </td>
                        <td className="owner-transactions-reference">
                          {b.GCash_Ref || "N/A"}
                        </td>
                        <td className="owner-transactions-proof">
                          {b.GCash_receipt ? (
                            <a
                              href={`http://localhost:5000/uploads/gcash_receipts/${b.GCash_receipt}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="proof-link"
                            >
                              <Eye size={16} />
                              View
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="owner-transactions-date">
                          {formatDate(b.issuedate)}
                        </td>
                        <td className="owner-transactions-status">
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="owner-transactions-actions">
                          {getActionsForBill(b)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;