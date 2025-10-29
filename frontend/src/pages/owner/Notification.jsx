import React, { useState, useEffect } from "react";
import {
  Search, ChevronRight, User, Calendar, Wrench, Filter, Download,
  MessageCircle, Clock, CheckCircle, AlertCircle, Trash2
} from "lucide-react";
import "../../styles/owners/Notification.css";

function Notification() {
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [problems, setProblems] = useState([]);
  const [uploadedLandlordImage, setUploadedLandlordImage] = useState(null);

  // ✅ Fetch all concerns from backend
  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/concerns");
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error("Error fetching concerns:", error);
      }
    };
    fetchConcerns();
  }, []);

  // ✅ Filter logic
  const filteredProblems = problems.filter(problem => {
    const matchesFilter = activeFilter === "All" || problem.status === activeFilter;
    const matchesSearch =
      (problem.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.unit?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const openProblemModal = (problem) => {
    setSelectedProblem(problem);
    setShowProblemModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock size={16} />;
      case "in progress": return <AlertCircle size={16} />;
      case "resolved": return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleDeleteClick = (problem, e) => {
    e.stopPropagation();
    setProblemToDelete(problem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!problemToDelete) return;
    try {
      setProblems(prev => prev.filter(problem => problem.id !== problemToDelete.id));
      setShowDeleteModal(false);
      setProblemToDelete(null);
      if (showProblemModal) setShowProblemModal(false);
    } catch (error) {
      console.error("Error deleting concern:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProblemToDelete(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedProblem || selectedProblem.status === "Resolved") return;
    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      const response = await fetch(`http://localhost:5000/api/concerns/${selectedProblem.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setProblems(prev =>
          prev.map(problem =>
            problem.id === selectedProblem.id ? { ...problem, status: newStatus } : problem
          )
        );
        setSelectedProblem(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const statusCounts = {
    All: problems.length,
    Pending: problems.filter(p => p.status === "Pending").length,
    "In Progress": problems.filter(p => p.status === "In Progress").length,
    Resolved: problems.filter(p => p.status === "Resolved").length
  };
  const handleUploadLandlordImage = async (file) => {
    if (!file || !selectedProblem) return;

    try {
      const formData = new FormData();
      formData.append("landlordimage", file);

      const response = await fetch(`http://localhost:5000/api/concerns/${selectedProblem.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedProblem((prev) => ({
          ...prev,
          landlordimage: data.concern.landlordimage,
        }));
        setProblems((prev) =>
          prev.map((p) =>
            p.id === selectedProblem.id
              ? { ...p, landlordimage: data.concern.landlordimage }
              : p
          )
        );
        alert("Fix photo uploaded successfully!");
      } else {
        alert("Failed to upload fix photo");
      }
    } catch (error) {
      console.error("Error uploading landlord image:", error);
    }
  };

  return (
    <div className="owner-notifications-page-container">
      {/* Header Section */}
      <div className="owner-notifications-header">
        <div className="owner-notifications-title-section">
          <h1>Maintenance Issues</h1>
          <p>Manage and track all tenant-reported problems</p>
        </div>
        <div className="owner-notifications-stats">
          <div className="owner-stat-card">
            <div className="stat-icon pending"><Clock size={20} /></div>
            <div className="stat-info">
              <span className="stat-number">{statusCounts.Pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="owner-stat-card">
            <div className="stat-icon progress"><AlertCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-number">{statusCounts["In Progress"]}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="owner-stat-card">
            <div className="stat-icon resolved"><CheckCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-number">{statusCounts.Resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="owner-notifications-content-card">
        <div className="owner-notifications-controls">
          <div className="owner-filter-group">
            <Filter size={18} className="owner-filter-icon" />
            <select
              className="owner-filter-dropdown"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              {Object.keys(statusCounts).map(filter => (
                <option key={filter} value={filter}>
                  {filter} ({statusCounts[filter]})
                </option>
              ))}
            </select>
          </div>

          <div className="owner-notifications-search">
            <Search size={18} className="owner-notifications-search-icon" />
            <input
              type="text"
              placeholder="Search by tenant, unit, or issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="owner-notifications-search-input"
            />
          </div>
        </div>

        {/* Problems List */}
        <div className="owner-notifications-list-wrapper">
          {filteredProblems.length === 0 ? (
            <div className="owner-notifications-empty">
              <div className="empty-state">
                <Wrench size={48} className="empty-icon" />
                <h3>No problems found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className={`owner-notification-item status-${problem.status.toLowerCase().replace(' ', '-')}`}
                onClick={() => openProblemModal(problem)}
              >
                <div className="owner-notification-header">
                  <div className="owner-notification-main">
                    <div className="owner-notification-icon"><Wrench size={20} /></div>
                    <div className="owner-notification-content">
                      <h4 className="owner-notification-title">{problem.subject}</h4>
                      <p className="owner-notification-description">{problem.description}</p>
                      <div className="owner-notification-meta">
                        <div className="owner-meta-item"><User size={14} /><span>{problem.tenant_name}</span></div>
                        <div className="owner-meta-item"><span className="owner-unit-badge">{problem.unit}</span></div>
                        <div className="owner-meta-item"><Calendar size={14} /><span>{new Date(problem.creationdate).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="owner-notification-actions">
                    <div className={`owner-status-badge status-${problem.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(problem.status)} {problem.status}
                    </div>
                    <div className="owner-action-buttons">
                      {problem.status === "Resolved" && (
                        <button
                          className="owner-delete-btn"
                          onClick={(e) => handleDeleteClick(problem, e)}
                          title="Delete resolved issue"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button className="owner-arrow-btn"><ChevronRight size={20} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Problem Modal */}
      {showProblemModal && selectedProblem && (
        <div className="owner-problem-modal-overlay">
          <div className="owner-problem-modal">
            <div className="owner-problem-modal-header">
              <div className="owner-modal-title-section">
                <h3>{selectedProblem.subject}</h3>
                <div className="owner-modal-badges">
                  <span className={`owner-status-badge status-${selectedProblem.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(selectedProblem.status)} {selectedProblem.status}
                  </span>
                </div>
              </div>
              <button className="owner-close-btn" onClick={() => setShowProblemModal(false)}>×</button>
            </div>

            <div className="owner-problem-modal-body">
              <div className="owner-detail-grid">
                <div className="owner-detail-item"><label>Tenant Name</label><p>{selectedProblem.tenant_name}</p></div>
                <div className="owner-detail-item"><label>Unit</label><p>{selectedProblem.unit}</p></div>
                <div className="owner-detail-item"><label>Date Reported</label><p>{new Date(selectedProblem.creationdate).toLocaleString()}</p></div>
              </div>

              <div className="owner-description-section">
                <label>Problem Description</label>
                <p>{selectedProblem.description}</p>
              </div>

              {selectedProblem.image && (
                <div className="owner-problem-photo">
                  <label>Tenant Attached Photo</label>
                  <div className="owner-photo-container">
                    <button
                      className="owner-view-photo-btn"
                      onClick={() =>
                        window.open(`http://localhost:5000/${selectedProblem.image}`, "_blank", "noopener,noreferrer")
                      }
                    >
                      View
                    </button>
                  </div>
                </div>
              )}


              {selectedProblem.status !== "Resolved" ? (
                <div className="owner-update-section">
                  <h4>Update Problem Status</h4>
                  <div className="owner-status-actions">
                    <button className="owner-status-btn progress" onClick={() => handleUpdateStatus("In Progress")}>
                      <AlertCircle size={16} /> Mark In Progress
                    </button>

                    {/* ✅ Upload Landlord Fix Photo */}
                    <label htmlFor="landlord-image-upload" className="owner-upload-photo-btn">
                      <Wrench size={16} /> Upload Fix Photo
                    </label>
                    <input
                      type="file"
                      id="landlord-image-upload"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleUploadLandlordImage(e.target.files[0])}
                    />

                    <button className="owner-status-btn resolved" onClick={() => handleUpdateStatus("Resolved")}>
                      <CheckCircle size={16} /> Mark Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div className="owner-resolved-message">
                  <CheckCircle size={24} className="resolved-check-icon" />
                  <h4>Issue Resolved</h4>
                  <p>This maintenance issue has been successfully resolved.</p>

                  {/* ✅ Show landlord’s uploaded fix photo */}
                  {selectedProblem.landlordimage && (
                    <button
                      className="owner-view-photo-btn"
                      onClick={() =>
                        window.open(
                          `http://localhost:5000/${selectedProblem.landlordimage}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      View Proof Photo
                    </button>
                  )}
                </div>
              )}

            </div>

            <div className="owner-problem-modal-footer">
              {selectedProblem.status === "Resolved" && (
                <button className="owner-delete-modal-btn" onClick={() => handleDeleteClick(selectedProblem)}>
                  <Trash2 size={16} /> Delete Resolved Issue
                </button>
              )}
              <button className="owner-close-modal-btn" onClick={() => setShowProblemModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteModal && problemToDelete && (
        <div className="owner-delete-modal-overlay">
          <div className="owner-delete-modal">
            <div className="owner-delete-modal-icon">
              <Trash2 size={48} />
            </div>
            <div className="owner-delete-modal-content">
              <h3>Delete Resolved Issue?</h3>
              <p>Are you sure you want to delete this resolved issue? This action cannot be undone.</p>
              <div className="owner-delete-modal-details">
                <p><strong>Issue:</strong> {problemToDelete.subject}</p>
                <p><strong>Tenant:</strong> {problemToDelete.tenant_name}</p>
                <p><strong>Unit:</strong> {problemToDelete.unit}</p>
              </div>
            </div>
            <div className="owner-delete-modal-actions">
              <button className="owner-delete-cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="owner-delete-confirm-btn" onClick={confirmDelete}>Yes, Delete Issue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;
