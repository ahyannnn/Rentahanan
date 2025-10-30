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
  User,
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
  const [headerProfilePictureUrl, setHeaderProfilePictureUrl] = useState("/default-profile.png");
  const [loading, setLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // ✅ Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "Rental Payment Due",
      message: "Your rent is due on October 30, 2025. Please make your payment soon.",
      time: "2 days left",
    },
    {
      id: 2,
      title: "Scheduled Maintenance",
      message: "Plumbing maintenance will occur on October 28.",
      time: "in 2 days",
    },
    {
      id: 3,
      title: "Receipt Confirmation",
      message: "Your last payment was received successfully.",
      time: "3 days ago",
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user profile data from API
  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/profile/${userId}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setUserData(data.profile);
        setApplicationStatus(data.profile.application_status || "Registered");
        setUserRole(data.profile.role?.toLowerCase() || "tenant");
        
        // Set profile picture URL for both modal and header
        if (data.profile.image) {
          const imageUrl = `http://127.0.0.1:5000/uploads/profile_images/${data.profile.image}`;
          setProfilePictureUrl(imageUrl);
          setHeaderProfilePictureUrl(imageUrl);
        } else {
          setProfilePictureUrl("/default-profile.png");
          setHeaderProfilePictureUrl("/default-profile.png");
        }
        
        localStorage.setItem("user", JSON.stringify(data.profile));
      } else {
        console.error("Failed to fetch profile:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUserRaw = localStorage.getItem("user");
        if (!storedUserRaw) {
          console.warn("No user found in localStorage — redirecting to login");
          navigate("/");
          return;
        }

        const storedUser = JSON.parse(storedUserRaw);
        const userId = storedUser.userid;

        if (userId) {
          await fetchUserProfile(userId);
        } else {
          setUserData(storedUser);
          setUserRole(localStorage.getItem("userRole") || storedUser.role || "tenant");
          setApplicationStatus(
            localStorage.getItem("applicationStatus") ||
            storedUser.application_status ||
            "Registered"
          );
        }
      } catch (error) {
        console.error("Error loading user:", error);
        navigate("/");
      }
    };

    initializeUser();
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsEditing(false);
    setSelectedImageFile(null); // Reset selected image when opening modal
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsEditing(false);
    setSelectedImageFile(null); // Reset selected image when closing modal
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      
      // Append ONLY editable fields
      formData.append("email", userData.email);
      formData.append("phone", userData.phone);
      
      // Append image file if a new one was selected
      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      const response = await fetch(`http://127.0.0.1:5000/api/profile/${userData.userid}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with new data
        setUserData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Update profile picture URL if image was uploaded
        if (data.user.image) {
          const imageUrl = `http://127.0.0.1:5000/api/profile/image/${data.user.image}`;
          setProfilePictureUrl(imageUrl);
          setHeaderProfilePictureUrl(imageUrl);
        }
        
        setIsEditing(false);
        setSelectedImageFile(null);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setProfilePictureUrl(tempUrl);
      // Store the file for upload
      setSelectedImageFile(file);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original image and data
    if (userData?.image) {
      const imageUrl = `http://localhost:5000/uploads/profile_images/${userData.image}`;
      setProfilePictureUrl(imageUrl);
      setHeaderProfilePictureUrl(imageUrl);
    } else {
      setProfilePictureUrl("/default-profile.png");
      setHeaderProfilePictureUrl("/default-profile.png");
    }
    setSelectedImageFile(null);
    
    // Reload fresh data from API to discard any changes
    if (userData?.userid) {
      fetchUserProfile(userData.userid);
    }
    setIsEditing(false);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    if (userRole === "owner") {
      navigate("/owner/notifications");
    } else {
      navigate("/tenant/notifications");
    }
  };

  const tenantLinksByStatus = {
    Registered: [{ name: "Browse Units", to: "/tenant/browse-units", icon: Building2 }],
    Pending: [
      { name: "Browse Units", to: "/tenant/browse-units", icon: Building2 },
      { name: "My Bills", to: "/tenant/bills", icon: CreditCard },
      { name: "Contract", to: "/tenant/contract", icon: ClipboardList },
      { name: "Concern", to: "/tenant/support", icon: HelpCircle },
    ],
    Approved: [
      { name: "Dashboard", to: "/tenant", icon: Home },
      { name: "My Bills", to: "/tenant/bills", icon: CreditCard },
      { name: "Payment History", to: "/tenant/payment", icon: FileText },
      { name: "Contract", to: "/tenant/contract", icon: ClipboardList },
      { name: "Concern", to: "/tenant/support", icon: HelpCircle },
    ],
    Rejected: [
      { name: "Dashboard", to: "/tenant", icon: Home },
      { name: "Concern", to: "/tenant/support", icon: HelpCircle },
    ],
  };

  const ownerLinks = [
    { name: "Dashboard", to: "/owner", icon: Home },
    { name: "Tenants", to: "/owner/tenants", icon: Users },
    { name: "Units", to: "/owner/units", icon: Building2 },
    { name: "Transactions", to: "/owner/transactions", icon: FileText },
    { name: "Billing", to: "/owner/billing", icon: CreditCard },
    { name: "Contract", to: "/owner/contract", icon: ClipboardList },
    { name: "Concern Center", to: "/owner/notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh", color: "#555" }}>
        <h2>Loading user data...</h2>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh", color: "#555" }}>
        <h2>No user data found</h2>
        <button onClick={() => navigate("/")}>Go to Login</button>
      </div>
    );
  }

  const links =
    userRole === "owner"
      ? ownerLinks
      : tenantLinksByStatus[applicationStatus || "Registered"] || [];

  const pageTitle =
    links.find((link) => link.to === location.pathname)?.name || "Dashboard";

  const ProfileModal = () => {
    if (!isProfileModalOpen || !userData) return null;
    
    const formatDate = (dateString) => {
      if (!dateString || dateString === "N/A") return "N/A";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return "N/A";
      }
    };

    return (
      <div className="modal-overlay-Layout" onClick={closeProfileModal}>
        <div className="profile-modal-content-Layout" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-Layout">
            <h2>User Profile</h2>
            <button className="close-text-btn-Layout" onClick={closeProfileModal}>
              <X size={16} /> Close
            </button>
          </div>

          <div className="modal-body-Layout">
            <div className="current-pic-holder-Layout">
              <img
                src={profilePictureUrl}
                alt="Profile"
                width="120"
                height="120"
                style={{ borderRadius: "50%", background: "#eee", objectFit: "cover" }}
              />
              {/* Show camera icon ONLY when editing */}
              {isEditing && (
                <label className="upload-btn-icon-label-Layout">
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            <h3 className="user-full-name-Layout">
              {userData.firstname} {userData.middlename || ""} {userData.lastname}
            </h3>
            <p className="user-role-label-Layout">
              Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>

            <div className="user-details-list-Layout">
              {/* Email - Editable */}
              <div className="detail-item-Layout">
                <Mail size={18} className="detail-icon-Layout" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email || ""}
                    onChange={handleInputChange}
                    className="editable-input-Layout"
                  />
                ) : (
                  <span>{userData.email || "N/A"}</span>
                )}
              </div>

              {/* Phone - Editable */}
              <div className="detail-item-Layout">
                <Phone size={18} className="detail-icon-Layout" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone || ""}
                    onChange={handleInputChange}
                    className="editable-input-Layout"
                  />
                ) : (
                  <span>{userData.phone || "N/A"}</span>
                )}
              </div>

              {/* Joined Date - Read Only */}
              <div className="detail-item-Layout detail-view-only-Layout">
                <Calendar size={18} className="detail-icon-Layout" />
                <span>Joined: {formatDate(userData.datecreated || "")}</span>
              </div>

              
            </div>

            <div className="modal-actions-Layout">
              {isEditing ? (
                <>
                  <button className="btn-save-Layout" onClick={handleSaveEdit}>
                    <Save size={16} /> Save
                  </button>
                  <button className="btn-cancel-Layout" onClick={handleCancelEdit}>
                    <RotateCcw size={16} /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn-edit-Layout" onClick={() => setIsEditing(true)}>
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
    <div className="container-Layout">
      {/* SIDEBAR */}
      <div className={`sidebar-Layout ${sidebarOpen ? "show-Layout" : ""}`} id="sidebar-Layout">
        <div className="logotitle-Layout">
          <div className="nav-brand-Layout">
            <img
              src="/logo.png"
              alt="RenTahanan Logo"
              className="logo-Layout"
            />
            <div className="nav-brand-Layout">RenTahanan</div>
          </div>
        </div>

        <div className="linkholderbody-Layout">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <div
                key={i}
                className={`linkholder-Layout ${
                  location.pathname === link.to ? "active-Layout" : ""
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

        <button id="logout-Layout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* HEADER */}
      <div className="header-Layout">
        <button className="menu-btn-Layout" onClick={toggleSidebar}>
          &#9776;
        </button>
        <h3>{pageTitle}</h3>
        <div className="notifprofile-Layout">
          <div className="notif-wrapper-Layout">
            <button
              className="notif-btn-Layout"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} color="white" />
            </button>

            {showNotifications && (
              <div className="notif-dropdown-Layout">
                <h4>Notifications</h4>
                {notifications.map((notif) => (
                  <div key={notif.id} className="notif-card-Layout">
                    <h5>{notif.title}</h5>
                    <p>{notif.message}</p>
                    <span className="notif-time-Layout">{notif.time}</span>
                  </div>
                ))}
                <button
                  className="view-all-btn-Layout"
                  onClick={handleViewAllNotifications}
                >
                  View All Notifications →
                </button>
              </div>
            )}
          </div>

          {/* Show profile image instead of user icon */}
          <button className="profile-image-btn-Layout" onClick={openProfileModal}>
            <img 
              src={headerProfilePictureUrl} 
              alt="Profile" 
              className="header-profile-image-Layout"
              onError={(e) => {
                e.target.src = "/default-profile.png";
              }}
            />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-Layout">
        <Outlet />
      </div>

      <ProfileModal />
    </div>
  );
};

export default Layout;