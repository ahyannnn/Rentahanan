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
  Camera,
  X,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  RotateCcw,
} from "lucide-react";
import "../styles/tenant/Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [userRole, setUserRole] = useState("tenant");
  const [profilePictureUrl, setProfilePictureUrl] = useState("/default-profile.png");

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load user from localStorage
  useEffect(() => {
    try {
      const storedUserRaw = localStorage.getItem("user");
      if (!storedUserRaw) {
        console.warn("No user found in localStorage — redirecting to login");
        navigate("/");
        return;
      }

      const storedUser = JSON.parse(storedUserRaw);
      const storedRole = localStorage.getItem("userRole") || storedUser.role || "tenant";
      const storedStatus =
        localStorage.getItem("applicationStatus") ||
        storedUser.application_status ||
        "Pending";

      console.log("Loaded user from localStorage:", storedUser);

      setUserData(storedUser);
      setUserRole(storedRole.toLowerCase());
      setApplicationStatus(storedStatus);
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      navigate("/");
    }
  }, [navigate]);

  // ✅ Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newUser = JSON.parse(localStorage.getItem("user"));
      if (!newUser) {
        navigate("/");
        return;
      }
      setUserData(newUser);
      setUserRole(localStorage.getItem("userRole")?.toLowerCase() || "tenant");
      setApplicationStatus(
        localStorage.getItem("applicationStatus") || newUser.application_status || "Pending"
      );
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsEditing(false);
  };
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    localStorage.setItem("user", JSON.stringify(userData));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserData(storedUser);
    setIsEditing(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setProfilePictureUrl(tempUrl);
    }
  };

  const tenantLinksByStatus = {
    Registered: [{ name: "Browse Units", to: "/tenant/browse-units", icon: Building2 }],
    Pending: [
      { name: "Dashboard", to: "/tenant", icon: Home },
      { name: "Browse Units", to: "/tenant/browse-units", icon: Building2 },
      { name: "My Bills", to: "/tenant/bills", icon: CreditCard },
      { name: "Contract", to: "/tenant/contract", icon: ClipboardList },
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

  const ownerLinks = [
    { name: "Dashboard", to: "/owner", icon: Home },
    { name: "Tenants", to: "/owner/tenants", icon: Users },
    { name: "Units", to: "/owner/units", icon: Building2 },
    { name: "Transactions", to: "/owner/transactions", icon: FileText },
    { name: "Billing", to: "/owner/billing", icon: CreditCard },
    { name: "Contract", to: "/owner/contract", icon: ClipboardList },
    { name: "Notifications", to: "/owner/notifications", icon: Bell },
    { name: "User Management", to: "/owner/user", icon: UserCog },
  ];

  if (!userData) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh", color: "#555" }}>
        <h2>Loading user data...</h2>
      </div>
    );
  }

  const links =
    userRole === "owner"
      ? ownerLinks
      : tenantLinksByStatus[applicationStatus || "Pending"] || [];

  const pageTitle =
    links.find((link) => link.to === location.pathname)?.name || "Dashboard";

  const ProfileModal = () => {
    if (!isProfileModalOpen || !userData) return null;
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const parts = dateString.split(" ")[0].split("-");
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    };

    return (
      <div className="modal-overlay" onClick={closeProfileModal}>
        <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>User Profile</h2>
            <button className="close-text-btn" onClick={closeProfileModal}>
              <X size={16} /> Close
            </button>
          </div>
          <div className="modal-body">
            <div className="current-pic-holder">
              <img
                src={profilePictureUrl}
                alt="Profile"
                width="120"
                height="120"
                style={{ borderRadius: "50%", background: "#eee", objectFit: "cover" }}
              />
              <label className="upload-btn-icon-label">
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>

            <h3 className="user-full-name">
              {userData.firstname} {userData.middlename || ""} {userData.lastname}
            </h3>
            <p className="user-role-label">
              Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>

            <div className="user-details-list">
              <div className="detail-item">
                <Mail size={18} className="detail-icon" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email || ""}
                    onChange={handleInputChange}
                    className="editable-input"
                  />
                ) : (
                  <span>{userData.email || "N/A"}</span>
                )}
              </div>

              <div className="detail-item">
                <Phone size={18} className="detail-icon" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone || ""}
                    onChange={handleInputChange}
                    className="editable-input"
                  />
                ) : (
                  <span>{userData.phone || "N/A"}</span>
                )}
              </div>

              <div className="detail-item detail-view-only">
                <Calendar size={18} className="detail-icon" />
                <span>Joined: {formatDate(userData.datecreated || "")}</span>
              </div>
            </div>

            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button className="btn-save" onClick={handleSaveEdit}>
                    <Save size={16} /> Save
                  </button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>
                    <RotateCcw size={16} /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <Edit size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`} id="sidebar">
        <div className="logotitle">
          <h1>RenTahan</h1>
        </div>
        <div className="linkholderbody">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <div key={i} className={`linkholder ${location.pathname === link.to ? "active" : ""}`}>
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
            src={profilePictureUrl}
            alt="Profile"
            width="40"
            height="40"
            style={{ borderRadius: "50%", cursor: "pointer", objectFit: "cover" }}
            onClick={openProfileModal}
          />
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <Outlet />
      </div>

      <ProfileModal />
    </div>
  );
};

export default Layout;
