import React, { useState, useEffect } from "react";
import "../../styles/owners/Tenants.css";
import { useNavigate } from "react-router-dom";

const Tenants = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [tenants, setTenants] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  // Fetch active tenants
  useEffect(() => {
    if (activeTab === "active") {
      fetch("http://localhost:5000/api/tenants/active")
        .then((res) => res.json())
        .then((data) => setTenants(data))
        .catch((err) => console.error("Error fetching active tenants:", err));
    }
  }, [activeTab]);

  // Fetch pending applicants
  useEffect(() => {
    if (activeTab === "applications") {
      fetch("http://localhost:5000/api/tenants/applicants")
        .then((res) => res.json())
        .then((data) => setApplicants(data))
        .catch((err) => console.error("Error fetching applicants:", err));
    }
  }, [activeTab]);

  const filterData = (data) =>
    data.filter((item) =>
      item.fullname.toLowerCase().includes(search.toLowerCase())
    );

  const openModal = (user) => {
    setSelectedUser(user);
    setSelectedDocument(null);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setSelectedDocument(null);
  };

  // Function to get profile image URL or fallback to initials
  const getProfileImage = (user) => {
    if (user.image) {
      return `http://localhost:5000/uploads/profile_images/${user.image}`;
    }
    return null;
  };

  // Function to handle image error and fallback to initials
  const handleImageError = (e, user) => {
    e.target.style.display = 'none';
    // Show the initials fallback
    const fallbackElement = e.target.nextSibling;
    if (fallbackElement) {
      fallbackElement.style.display = 'flex';
    }
  };

  const renderCards = (data, type) =>
    data.map((item, index) => (
      <div className="Owner-Tenant-card" key={index}>
        <div className="Owner-Tenant-avatar">
          {getProfileImage(item) ? (
            <>
              <img 
                src={getProfileImage(item)} 
                alt={item.fullname}
                className="Owner-Tenant-avatar-image"
                onError={(e) => handleImageError(e, item)}
              />
              <div className="Owner-Tenant-avatar-fallback" style={{display: 'none'}}>
                {item.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </>
          ) : (
            <div className="Owner-Tenant-avatar-fallback">
              {item.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
        </div>
        <div className="Owner-Tenant-info">
          <h4>{item.fullname}</h4>
          <p>Email: {item.email}</p>
          <p>Phone: {item.phone}</p>
          <p>Unit: {item.unit_name || "N/A"}</p>
          {type === "applicant" && (
            <div className="Owner-Tenant-status-badge">
              {item.contract_signed ? "Contract Signed" : "Pending Contract"}
            </div>
          )}
        </div>
        <button className="Owner-Tenant-view-profile-btn" onClick={() => openModal(item)}>
          {type === "active" ? "View Profile" : "Review Application"}
        </button>
      </div>
    ));

  const handleApprove = async (applicationId) => {
    if (window.confirm("Are you sure you want to approve this application?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/tenants/approve/${applicationId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          alert("Application approved successfully!");
          closeModal();
          setApplicants((prev) =>
            prev.filter((a) => a.applicationid !== applicationId)
          );
        } else {
          alert("Failed to approve application.");
        }
      } catch (error) {
        console.error("Error approving application:", error);
        alert("An error occurred while approving the application.");
      }
    }
  };

  const handleReject = async (applicationId) => {
    const reason = prompt(
      "Enter reason for rejection (optional):",
      "Incomplete requirements"
    );
    if (reason === null) return;

    if (window.confirm("Are you sure you want to reject this application?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/tenants/reject/${applicationId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          }
        );

        if (response.ok) {
          alert("Application rejected successfully!");
          closeModal();
          setApplicants((prev) =>
            prev.filter((a) => a.applicationid !== applicationId)
          );
        } else {
          alert("Failed to reject application.");
        }
      } catch (error) {
        console.error("Error rejecting application:", error);
        alert("An error occurred while rejecting the application.");
      }
    }
  };

  const handleIssueContract = (applicationId) => {
    navigate("/owner/contract", {
      state: { openTab: "issue", selectedApplicantId: applicationId },
    });
  };

  const handleAdvancePayment = (applicationId) => {
    navigate("/owner/billing", {
      state: { openApplicants: true, applicationId },
    });
  };

  return (
    <div className="Owner-Tenant-container">
      <div className="Owner-Tenant-header-section">
        <h2 className="Owner-Tenant-title">Tenant Management</h2>
        <p className="Owner-Tenant-subtitle">Manage active tenants and review applications</p>
      </div>

      {/* Tabs + Search */}
      <div className="Owner-Tenant-header">
        <div className="Owner-Tenant-tabs">
          <button
            className={`Owner-Tenant-tab ${activeTab === "active" ? "Owner-Tenant-tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <span className="Owner-Tenant-tab-icon">👥</span>
            Active Tenants
            <span className="Owner-Tenant-tab-badge">{tenants.length}</span>
          </button>
          <button
            className={`Owner-Tenant-tab ${activeTab === "applications" ? "Owner-Tenant-tab-active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            <span className="Owner-Tenant-tab-icon">📋</span>
            Applications
            <span className="Owner-Tenant-tab-badge">{applicants.length}</span>
          </button>
        </div>
        <div className="Owner-Tenant-search-container">
          <input
            type="text"
            placeholder="Search by name..."
            className="Owner-Tenant-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="Owner-Tenant-search-icon">🔍</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="Owner-Tenant-grid">
        {activeTab === "active"
          ? renderCards(filterData(tenants), "active")
          : renderCards(filterData(applicants), "applicant")}
        
        {filterData(activeTab === "active" ? tenants : applicants).length === 0 && (
          <div className="Owner-Tenant-empty-state">
            <div className="Owner-Tenant-empty-icon">📭</div>
            <h3>No {activeTab === "active" ? "active tenants" : "applications"} found</h3>
            <p>
              {search ? "Try adjusting your search terms" : 
               activeTab === "active" ? "No tenants are currently active" : "No pending applications"}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="Owner-Tenant-modal-overlay" onClick={closeModal}>
          <div className="Owner-Tenant-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="Owner-Tenant-modal-header">
              <div className="Owner-Tenant-modal-user-info">
                <div className="Owner-Tenant-modal-avatar">
                  {getProfileImage(selectedUser) ? (
                    <>
                      <img 
                        src={getProfileImage(selectedUser)} 
                        alt={selectedUser.fullname}
                        className="Owner-Tenant-modal-avatar-image"
                        onError={(e) => handleImageError(e, selectedUser)}
                      />
                      <div className="Owner-Tenant-modal-avatar-fallback" style={{display: 'none'}}>
                        {selectedUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="Owner-Tenant-modal-avatar-fallback">
                      {selectedUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2>{selectedUser.fullname}</h2>
                  <p className="Owner-Tenant-modal-email">{selectedUser.email}</p>
                </div>
              </div>
              <button className="Owner-Tenant-close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="Owner-Tenant-modal-body">
              <div className="Owner-Tenant-info-grid">
                <div className="Owner-Tenant-info-item">
                  <label>Phone</label>
                  <span>{selectedUser.phone}</span>
                </div>
                <div className="Owner-Tenant-info-item">
                  <label>Unit</label>
                  <span>{selectedUser.unit_name || "N/A"}</span>
                </div>
                <div className="Owner-Tenant-info-item">
                  <label>Date of Birth</label>
                  <span>{selectedUser.dateofbirth}</span>
                </div>
                <div className="Owner-Tenant-info-item Owner-Tenant-info-full">
                  <label>Address</label>
                  <span>{selectedUser.address}</span>
                </div>
              </div>

              {activeTab === "applications" && (
                <>
                  <div className="Owner-Tenant-documents-section">
                    <h3>Required Documents</h3>
                    <div className="Owner-Tenant-documents-grid">
                      <div className="Owner-Tenant-document-item">
                        <span className="Owner-Tenant-document-label">Valid ID</span>
                        <button
                          className="Owner-Tenant-document-btn"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/uploads/valid_ids/${selectedUser.valid_id}`,
                              "_blank"
                            )
                          }
                        >
                          View Document
                        </button>
                      </div>
                      <div className="Owner-Tenant-document-item">
                        <span className="Owner-Tenant-document-label">Barangay Clearance</span>
                        <button
                          className="Owner-Tenant-document-btn"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/uploads/brgy_clearances/${selectedUser.brgy_clearance}`,
                              "_blank"
                            )
                          }
                        >
                          View Document
                        </button>
                      </div>
                      <div className="Owner-Tenant-document-item">
                        <span className="Owner-Tenant-document-label">Proof of Income</span>
                        <button
                          className="Owner-Tenant-document-btn"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/uploads/proof_of_income/${selectedUser.proof_of_income}`,
                              "_blank"
                            )
                          }
                        >
                          View Document
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="Owner-Tenant-action-buttons">
                    <button
                      className="Owner-Tenant-action-btn Owner-Tenant-contract-btn"
                      onClick={() => handleIssueContract(selectedUser.applicationid)}
                    >
                      📄 Issue Contract
                    </button>
                    <button
                      className="Owner-Tenant-action-btn Owner-Tenant-payment-btn"
                      onClick={() => handleAdvancePayment(selectedUser.applicationid)}
                    >
                      💳 Issue Initial Payment
                    </button>
                  </div>

                  <div className="Owner-Tenant-approval-section">
                    <div className="Owner-Tenant-approval-status">
                      <div className={`Owner-Tenant-status-item ${selectedUser.contract_signed ? 'Owner-Tenant-status-complete' : 'Owner-Tenant-status-pending'}`}>
                        Contract: {selectedUser.contract_signed ? "Signed" : "Pending"}
                      </div>
                      <div className={`Owner-Tenant-status-item ${selectedUser.bill_status === 'Paid' ? 'Owner-Tenant-status-complete' : 'Owner-Tenant-status-pending'}`}>
                        Payment: {selectedUser.bill_status === 'Paid' ? "Completed" : "Pending"}
                      </div>
                    </div>
                    
                    <div className="Owner-Tenant-approval-buttons">
                      <button
                        className="Owner-Tenant-approve-btn"
                        onClick={() => handleApprove(selectedUser.applicationid)}
                        disabled={
                          selectedUser.bill_status !== "Paid" || !selectedUser.contract_signed
                        }
                        title={
                          selectedUser.bill_status !== "Paid"
                            ? "Cannot approve: Initial payment not completed"
                            : !selectedUser.contract_signed
                              ? "Cannot approve: Contract not signed"
                              : ""
                        }
                      >
                        ✅ Approve Application
                      </button>
                      <button
                        className="Owner-Tenant-reject-btn"
                        onClick={() => handleReject(selectedUser.applicationid)}
                      >
                        ❌ Reject Application
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;