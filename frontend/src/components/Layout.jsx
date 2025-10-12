import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../styles/tenant/Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get applicationStatus from localStorage (persistent)
  const [applicationStatus, setApplicationStatus] = useState(
    localStorage.getItem("applicationStatus") || "Pending"
  );

  useEffect(() => {
    // Optional: refresh data from localStorage in case it changes
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

  // ✅ Sidebar links based on status
  const linksByStatus = {
    Pending: [
      { name: "Dashboard", to: "/tenant" },
      { name: "Browse Units", to: "/tenant/browse-units" },
      { name: "Support", to: "/tenant/support" },
    ],
    Approved: [
      { name: "Dashboard", to: "/tenant" },
      { name: "My Bills", to: "/tenant/bills" },
      { name: "Payment History", to: "/tenant/payment" },
      { name: "Contract", to: "/tenant/contract" },
      { name: "Support", to: "/tenant/support" },
    ],
    Rejected: [
      { name: "Dashboard", to: "/tenant" },
      { name: "Support", to: "/tenant/support" },
    ],
  };

  const links = linksByStatus[applicationStatus] || [];
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
          {links.map((link, index) => (
            <div
              key={index}
              className={`linkholder ${
                location.pathname === link.to ? "active" : ""
              }`}
            >
              <Link to={link.to} onClick={closeSidebar}>
                {link.name}
              </Link>
            </div>
          ))}
        </div>

        <button id="logout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* OVERLAY for mobile */}
      <div
        id="overlay"
        className={sidebarOpen ? "show" : ""}
        onClick={closeSidebar}
      ></div>

      {/* HEADER */}
      <div className="header">
        <button className="menu-btn" id="menu-btn" onClick={toggleSidebar}>
          &#9776;
        </button>
        <h3>{pageTitle}</h3>
        <div className="notifprofile">
          <button className="notif-btn">
            <img src="" alt="Notif" />
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