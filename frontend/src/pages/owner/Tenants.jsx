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
            Applications
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

              {/* HEADER: Dito magkasama ang Pangalan at ang Close button */}
              <div className="modal-header-fixed">
                <h2>{selectedUser.fullname}</h2>
                <button className="close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>

              {/* CONTENT: Walang scrollbar sa loob */}
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Unit:</strong> {selectedUser.unit_name || "N/A"}</p>
              <p><strong>DOB:</strong> {selectedUser.dateofbirth}</p>
              <p><strong>Address:</strong> {selectedUser.address}</p>

              {activeTab === "active" && (
                <>
                  <p><strong>Unit Price:</strong> {selectedUser.unit_price}</p>
                  <p className="document-row">
                    <strong>Valid ID:</strong>
                    <button className="document-btn action-primary"
                      onClick={() => console.log('View Valid ID:', selectedUser.valid_id)}>
                      {selectedUser.valid_id ? "View Document" : "View"}
                    </button>
                  </p>
                  <p className="document-row">
                    <strong>Clearance:</strong>
                    <button className="document-btn action-primary"
                      onClick={() => console.log('View Clearance:', selectedUser.brgy_clearance)}>
                      {selectedUser.brgy_clearance ? "View Document" : "View"}
                    </button>
                  </p>
                  <p className="document-row">
                    <strong>Income:</strong>
                    <button className="document-btn action-primary"
                      onClick={() => console.log('View Proof of Income:', selectedUser.proof_of_income)}>
                      {selectedUser.proof_of_income ? "View Document" : "View"}
                    </button>
                  </p>
                </>
              )}

              {activeTab === "applications" && (
                <>
                  <p className="document-row">
                    <strong>Valid ID:</strong>
                    <button className="document-btn action-primary"
                      onClick={() => console.log('Review Valid ID:', selectedUser.valid_id)}>
                      {selectedUser.valid_id ? "Review Document" : "View"}
                    </button>
                  </p>
                  <p className="document-row">
                    <strong>Clearance:</strong>
                    <button className="document-btn action-primary"
                      onClick={() => console.log('Review Clearance:', selectedUser.brgy_clearance)}>
                      {selectedUser.brgy_clearance ? "Review Document" : "View"}
                    </button>
                  </p>
                  <p className="document-row">
                    <strong>Income:</strong>
                    <button className="document-btn action-primary"
                      onClick={() => console.log('Review Proof of Income:', selectedUser.proof_of_income)}>
                      {selectedUser.proof_of_income ? "Review Document" : "View"}
                    </button>
                  </p>
                </>
              )}

            </div>
          </div>
      )}
    </div>
  );
};

export default Tenants;
