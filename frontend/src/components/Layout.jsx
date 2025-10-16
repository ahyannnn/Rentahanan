import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Building2,
  FileText,
  CreditCard,
  Bell,
  UserCog,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import "../styles/tenant/Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [applicationStatus, setApplicationStatus] = useState(
    localStorage.getItem("applicationStatus") || "Pending"
  );

  const userRole = localStorage.getItem("userRole") || "tenant";

  useEffect(() => {
    const storedStatus = localStorage.getItem("applicationStatus");
    if (storedStatus && storedStatus !== applicationStatus) {
      setApplicationStatus(storedStatus);
    }
  }, [applicationStatus]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("applicationStatus");
    navigate("/");
  };

  // ✅ Tenant links by status
  const tenantLinksByStatus = {
    Pending: [
      { name: "Dashboard", to: "/tenant", icon: Home },
      { name: "Browse Units", to: "/tenant/browse-units", icon: Building2 },
      { name: "Support", to: "/tenant/support", icon: HelpCircle },
    ],
    Approved: [
      { name: "Dashboard", to: "/tenant", icon: Home },
      { name: "My Bills", to: "/tenant/bills", icon: CreditCard },
      { name: "Payment History", to: "/tenant/payment", icon: FileText },
      { name: "Contract", to: "/tenant/contract", icon: ClipboardList },
      { name: "Support", to: "/tenant/support", icon: HelpCircle },
    ],
    Rejected: [
      { name: "Dashboard", to: "/tenant", icon: Home },
      { name: "Support", to: "/tenant/support", icon: HelpCircle },
    ],
  };

  // ✅ Owner links (7 items)
  const ownerLinks = [
    { name: "Dashboard", to: "/owner", icon: Home },
    { name: "Tenants", to: "/owner/tenants", icon: Users },
    { name: "Units", to: "/owner/units", icon: Building2 },
    { name: "Transactions", to: "/owner/transactions", icon: FileText },
    { name: "Billing", to: "/owner/billing", icon: CreditCard },
    { name: "Notifications", to: "/owner/notifications", icon: Bell },
    { name: "User Management", to: "/owner/user", icon: UserCog },
  ];

  const links =
    userRole === "owner"
      ? ownerLinks
      : tenantLinksByStatus[applicationStatus] || [];

  const pageTitle =
    links.find((link) => link.to === location.pathname)?.name || "Dashboard";

  return (
    <div className="container">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`} id="sidebar">
        <div className="logotitle">
          <img src="" alt="LOGO" />
          <h1>PHOME</h1>
        </div>

        <div className="linkholderbody">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <div
                key={index}
                className={`linkholder ${
                  location.pathname === link.to ? "active" : ""
                }`}
              >
                <Link to={link.to} onClick={closeSidebar}>
                  <Icon size={18} style={{ marginRight: "8px" }} />
                  {link.name}
                </Link>
              </div>
            );
          })}
        </div>

        <button id="logout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* OVERLAY */}
      <div
        id="overlay"
        className={sidebarOpen ? "show" : ""}
        onClick={closeSidebar}
      ></div>

      {/* HEADER */}
      <div className="header">
        <button className="menu-btn" onClick={toggleSidebar}>
          &#9776;
        </button>
        <h3>{pageTitle}</h3>
        <div className="notifprofile">
          <button className="notif-btn">
            <Bell size={20} />
          </button>
          <img
            src=""
            alt="Profile"
            width="40"
            height="40"
            style={{ borderRadius: "50%", background: "#ccc" }}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
