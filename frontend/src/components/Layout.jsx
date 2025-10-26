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
  User, // Add this import
} from "lucide-react";
import "../styles/tenant/Layout.css";

// MOCK USER DATA based on your uploaded image
const mockUsersData = {
  owner: {
    fullName: "John Smith",
    email: "john.owner@example.com",
    phone: "09171234567",
    dateCreated: "2025-10-06 04:57:42",
  },
  tenant: {
    fullName: "Alice Garcia",
    email: "alice.tenant@example.com",
    phone: "09181234567",
    dateCreated: "2025-10-06 04:57:42",
  },
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Controls the Edit/View mode of the profile details
  const [isEditing, setIsEditing] = useState(false);

  // Initialize role and application status
  const initialRole = (localStorage.getItem("userRole") || "tenant").toLowerCase();
  const [userRole, setUserRole] = useState(initialRole);

  // Use a deep copy of the mock data for editing
  const [userData, setUserData] = useState(JSON.parse(JSON.stringify(mockUsersData[initialRole])));
  // Keep track of original data for "Cancel" functionality
  const [originalData, setOriginalData] = useState(JSON.parse(JSON.stringify(mockUsersData[initialRole])));

  const [applicationStatus, setApplicationStatus] = useState(
    initialRole === "tenant"
      ? localStorage.getItem("applicationStatus") || "Pending"
      : null
  );

  const [profilePictureUrl, setProfilePictureUrl] = useState("/default-profile.png");

  const location = useLocation();
  const navigate = useNavigate();

  // Effect to handle role changes (e.g., from local storage)
  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("userRole") || "tenant";
      const newRole = role.toLowerCase();
      setUserRole(newRole);

      const newUserData = JSON.parse(JSON.stringify(mockUsersData[newRole] || mockUsersData.tenant));
      setUserData(newUserData);
      setOriginalData(newUserData); // Update original data as well

      if (newRole === "tenant") {
        setApplicationStatus(localStorage.getItem("applicationStatus") || "Pending");
      } else {
        setApplicationStatus(null);
      }
    };

    // Initialize data on component mount based on initialRole
    const initialUserData = JSON.parse(JSON.stringify(mockUsersData[initialRole] || mockUsersData.tenant));
    setUserData(initialUserData);
    setOriginalData(initialUserData);

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // HANDLERS FOR THE PROFILE MODAL
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsEditing(false); // Always start in View mode
  }
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // NEW HANDLERS FOR EDITING
  const toggleEditMode = () => setIsEditing(true);

  const handleCancelEdit = () => {
    // Revert changes to original data
    setUserData(originalData);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    // In a real application, you would make an API call here.
    // After a successful save:
    setOriginalData(JSON.parse(JSON.stringify(userData))); // Update original data
    console.log("Saving changes:", userData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("applicationStatus");
    navigate("/");
  };

  // Profile picture upload logic
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setProfilePictureUrl(tempUrl);
    }
  };

  // Modal Component Definition
  const ProfileModal = () => {
    if (!isProfileModalOpen || !userData) return null;

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const parts = dateString.split(' ')[0].split('-');
      // Assuming YYYY-MM-DD format
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    return (
      <div className="modal-overlay" onClick={closeProfileModal}>
        <div
          className="profile-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>User Profile</h2>
            {/* UPDATED: Use Close text button */}
            <button className="close-text-btn" onClick={closeProfileModal}>
              <X size={16} style={{ marginRight: "4px" }} />
              Close
            </button>
          </div>

          <div className="modal-body">
            <div className="current-pic-holder">
              <img
                src={profilePictureUrl}
                alt="Current Profile"
                width="120"
                height="120"
                style={{ borderRadius: "50%", background: "#eee", objectFit: "cover" }}
              />
              {/* Separate Upload Button */}
              <label className="upload-btn-icon-label" title="Change Profile Picture">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Display User Details */}
            <h3 className="user-full-name">{userData.fullName}</h3>
            <p className="user-role-label">Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>

            <div className="user-details-list">
              {/* Email - Editable */}
              <div className="detail-item">
                <Mail size={18} className="detail-icon" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="editable-input"
                  />
                ) : (
                  <span>{userData.email}</span>
                )}
              </div>
              {/* Phone - Editable */}
              <div className="detail-item">
                <Phone size={18} className="detail-icon" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="editable-input"
                  />
                ) : (
                  <span>{userData.phone}</span>
                )}
              </div>
              {/* Date Created - View Only */}
              <div className="detail-item detail-view-only">
                <Calendar size={18} className="detail-icon" />
                <span title={userData.dateCreated}>
                  Joined: {formatDate(userData.dateCreated)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button className="btn-save" onClick={handleSaveEdit}>
                    <Save size={16} style={{ marginRight: "5px" }} />
                    Save Changes
                  </button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>
                    <RotateCcw size={16} style={{ marginRight: "5px" }} />
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn-edit" onClick={toggleEditMode}>
                  <Edit size={16} style={{ marginRight: "5px" }} />
                  Edit Profile
                </button>
              )}
            </div>

            <p className="modal-tip">JPG or PNG allowed. Max size 2MB.</p>
          </div>
        </div>
      </div>
    );
  };


  // Tenant links by application status
  const tenantLinksByStatus = {
    Registered: [
      { name: "Browse Units", to: "/tenant/browse-units", icon: Building2 },
    ],
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

  // Owner links
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

  const links =
    userRole.toLowerCase() === "owner"
      ? ownerLinks
      : tenantLinksByStatus[applicationStatus || "Pending"] || [];

  const pageTitle =
    links.find((link) => link.to === location.pathname)?.name || "Dashboard";

  return (
    <div className="container">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`} id="sidebar">
        <div className="logotitle">
          <img src="" alt="LOGO" />
          <h1>RenTahan</h1>
        </div>

        <div className="linkholderbody">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <div
                key={index}
                className={`linkholder ${location.pathname === link.to ? "active" : ""
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
          {/* Replace the img with User icon */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#0a2d8d",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={openProfileModal}
          >
            <User size={24} color="white" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        <Outlet />
      </div>

      {/* PROFILE MODAL (Rendered here) */}
      <ProfileModal />
    </div>
  );
};

export default Layout;