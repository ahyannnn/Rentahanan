import React, { useState } from "react";
import "../../styles/owners/Tenants.css";

const Tenants = () => {
  const [activeTab, setActiveTab] = useState("active");

  const tenants = [
    { name: "Juan Dela Cruz", number: "09695452211", unit: "House 1" },
    { name: "Maria Santos", number: "09585622410", unit: "House 2" },
    { name: "Pedro Cruz", number: "09175487521", unit: "House 3" },
    { name: "Ana Reyes", number: "09465587412", unit: "House 4" },
  ];

  return (
    <div className="tenants-container">
      <h2 className="tenants-title">TENANTS</h2>

      {/* ==== Tabs + Search ==== */}
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
        <input type="text" placeholder="Search" className="search-input" />
      </div>

      {/* ==== Cards Grid ==== */}
      <div className="tenants-grid">
        {tenants.map((tenant, index) => (
          <div className="tenant-card" key={index}>
            <div className="tenant-avatar"></div>
            <div className="tenant-info">
              <h4>{tenant.name}</h4>
              <p>Number: {tenant.number}</p>
              <p>Unit: {tenant.unit}</p>
            </div>
            <button className="view-profile-btn">View Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tenants;
