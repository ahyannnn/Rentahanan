import React, { useState, useEffect } from "react";
import "../../styles/owners/Tenants.css";

const Tenants = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [tenants, setTenants] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // For popup modal

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

  const openModal = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const renderCards = (data, type) =>
    data.map((item, index) => (
      <div className="tenant-card" key={index}>
        <div className="tenant-avatar"></div>
        <div className="tenant-info">
          <h4>{item.fullname}</h4>
          <p>Email: {item.email}</p>
          <p>Phone: {item.phone}</p>
          <p>Unit: {item.unit_name || "N/A"}</p>
        </div>
        <button
          className="view-profile-btn"
          onClick={() => openModal(item)}
        >
          {type === "active" ? "View Profile" : "Review"}
        </button>
      </div>
    ));

  const handleApprove = async (applicationId) => {
    if (window.confirm("Are you sure you want to approve this application?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/tenants/approve/${selectedUser?.applicationid}`,
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

  console.log("applicationid", selectedUser?.applicationid);

  const handleReject = async (applicationId) => {
    const reason = prompt(
      "Enter reason for rejection (optional):",
      "Incomplete requirements"
    );
    if (reason === null) return;

    if (window.confirm("Are you sure you want to reject this application?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/tenants/reject/${selectedUser?.applicationid}`,
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


  return (
    <div className="tenants-container">
      <h2 className="tenants-title">TENANTS</h2>

      {/* Tabs + Search */}
      <div className="tenants-header">
        <div className="tabs">
          <button
            className={activeTab === "active" ? "tab active" : "tab"}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={activeTab === "applications" ? "tab active" : "tab"}
            onClick={() => setActiveTab("applications")}
          >
            Applicant
          </button>
        </div>
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards Grid */}
      <div className="tenants-grid">
        {activeTab === "active"
          ? renderCards(filterData(tenants), "active")
          : renderCards(filterData(applicants), "applicant")}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-fixed">
              <h2>{selectedUser.fullname}</h2>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>

            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone}</p>
            <p><strong>Unit:</strong> {selectedUser.unit_name || "N/A"}</p>
            <p><strong>DOB:</strong> {selectedUser.dateofbirth}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>

            {activeTab === "applications" && (
              <>
                <p className="document-row">
                  <strong>Valid ID:</strong>
                  <button className="document-btn action-primary">
                    Review Document
                  </button>
                </p>
                <p className="document-row">
                  <strong>Clearance:</strong>
                  <button className="document-btn action-primary">
                    Review Document
                  </button>
                </p>
                <p className="document-row">
                  <strong>Income:</strong>
                  <button className="document-btn action-primary">
                    Review Document
                  </button>
                </p>
                
                <button
                  className="issue-contract-btn"
                  onClick={() => handleIssueContract(selectedUser.applicationid)}
                >
                  ISSUE CONTRACT
                </button>

                <button
                  className="advance-payment-btn"
                  onClick={() => handleAdvancePayment(selectedUser.applicationid)}
                >
                  ADVANCE PAYMENT
                </button>


                {/* ✅ APPROVE + REJECT BUTTONS */}
                <div className="approve-section">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(selectedUser.applicationid)}
                  >
                    APPROVE APPLICATION
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(selectedUser.applicationid)}
                  >
                    REJECT APPLICATION
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
