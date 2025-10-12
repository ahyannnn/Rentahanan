import React from "react";
import { Link } from "react-router-dom";
import "./TenantSidebar.css";

const TenantSidebar = ({ applicationStatus }) => {
  const linksByStatus = {
    Pending: [
      { name: "Dashboard", icon: "/icon/tenant/dashboard.png", to: "/tenant/dashboard", active: true },
      { name: "Browse Units", icon: "/icon/tenant/browse.png", to: "/tenant/browse-units" },
      { name: "Support", icon: "/icon/tenant/support.png", to: "/tenant/support" },
    ],
    Approved: [
      { name: "Dashboard", icon: "/icon/tenant/dashboard.png", to: "/tenant/dashboard", active: true },
      { name: "My Bills", icon: "/icon/tenant/billing.png", to: "/tenant/bills" },
      { name: "Payment History", icon: "/icon/tenant/payment.png", to: "/tenant/payment" },
      { name: "Contract", icon: "/icon/tenant/contract.png", to: "/tenant/contract" },
      { name: "Support", icon: "/icon/tenant/support.png", to: "/tenant/support" },
    ],
    Rejected: [
      { name: "Dashboard", icon: "/icon/tenant/dashboard.png", to: "/tenant/dashboard", active: true },
      { name: "Support", icon: "/icon/tenant/support.png", to: "/tenant/support" },
    ],
  };

  const links = linksByStatus[applicationStatus] || [];

  return (
    <div className="sidebar" id="sidebar">
      <div className="logotitle">
        <img src="" alt="LOGO" />
        <h1>PHOME</h1>
      </div>

      <div className="linkholderbody">
        {links.map((link, index) => (
          <div
            key={index}
            className={`linkholder ${link.active ? "active" : ""}`}
          >
            <img src={link.icon} alt="logo" />
            <Link to={link.to}>{link.name}</Link>
          </div>
        ))}
      </div>

      <button id="logout">Log out</button>
    </div>
  );
};

export default TenantSidebar;
