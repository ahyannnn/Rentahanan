import React, { useState } from "react";
import { Search, ChevronRight, User, Calendar, Wrench, Filter, Download, MessageCircle, Clock, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import "../../styles/owners/Notification.css";

function Notification() {
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [problems, setProblems] = useState([
    {
      id: 1,
      tenant: "Juan Dela Cruz",
      unit: "A-2B",
      date: "2025-10-15",
      type: "Water Leak",
      description: "May tumatagas sa ceiling ng bathroom kapag malakas ulan.",
      image: "https://via.placeholder.com/400x250?text=Water+Leak+Problem",
      title: "Water leakage in the unit",
      status: "Pending",
    },
    {
      id: 2,
      tenant: "Maria Santos",
      unit: "B-3A",
      date: "2025-10-10",
      type: "Lock Issue",
      description: "Hindi naisasara nang maayos ang pinto ng kwarto.",
      image: "https://via.placeholder.com/400x250?text=Broken+Door+Lock",
      title: "Broken door lock",
      status: "In Progress",
    },
    {
      id: 3,
      tenant: "Carlos Reyes",
      unit: "C-1C",
      date: "2025-10-08",
      type: "Electrical",
      description: "Walang kuryente sa kitchen area simula kagabi.",
      image: "https://via.placeholder.com/400x250?text=No+Electricity+in+Kitchen",
      title: "No electricity in kitchen",
      status: "Resolved",
    },
    {
      id: 4,
      tenant: "Anna Lopez",
      unit: "D-4B",
      date: "2025-10-12",
      type: "AC Repair",
      description: "Aircon hindi lumalamig, may unusual noise.",
      image: "https://via.placeholder.com/400x250?text=AC+Repair+Needed",
      title: "Air conditioning not working",
      status: "Pending",
    }
  ]);

  const filteredProblems = problems.filter(problem => {
    const matchesFilter = activeFilter === "All" || problem.status === activeFilter;
    const matchesSearch = problem.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.unit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openProblemModal = (problem) => {
    setSelectedProblem(problem);
    setShowProblemModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock size={16} />;
      case "In Progress": return <AlertCircle size={16} />;
      case "Resolved": return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleDeleteClick = (problem, e) => {
    e.stopPropagation();
    setProblemToDelete(problem);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (problemToDelete) {
      setProblems(prev => prev.filter(problem => problem.id !== problemToDelete.id));
      setShowDeleteModal(false);
      setProblemToDelete(null);
      if (showProblemModal) {
        setShowProblemModal(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProblemToDelete(null);
  };

  const handleUpdateStatus = (newStatus) => {
    if (selectedProblem && selectedProblem.status !== "Resolved") {
      setProblems(prev =>
        prev.map(problem =>
          problem.id === selectedProblem.id 
            ? { ...problem, status: newStatus }
            : problem
        )
      );
      setSelectedProblem(prev => ({ ...prev, status: newStatus }));
    }
  };

  const statusCounts = {
    All: problems.length,
    Pending: problems.filter(p => p.status === "Pending").length,
    "In Progress": problems.filter(p => p.status === "In Progress").length,
    Resolved: problems.filter(p => p.status === "Resolved").length
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
            <div className="stat-icon pending">
              <Clock size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{statusCounts.Pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="owner-stat-card">
            <div className="stat-icon progress">
              <AlertCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{statusCounts["In Progress"]}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="owner-stat-card">
            <div className="stat-icon resolved">
              <CheckCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{statusCounts.Resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="owner-notifications-content-card">
        {/* Control Bar */}
        <div className="owner-notifications-controls">
          <div className="owner-controls-left">
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
                    <div className="owner-notification-icon">
                      <Wrench size={20} />
                    </div>
                    <div className="owner-notification-content">
                      <div className="owner-notification-title-section">
                        <h4 className="owner-notification-title">{problem.title}</h4>
                      </div>
                      <p className="owner-notification-description">{problem.description}</p>
                      <div className="owner-notification-meta">
                        <div className="owner-meta-item">
                          <User size={14} />
                          <span>{problem.tenant}</span>
                        </div>
                        <div className="owner-meta-item">
                          <span className="owner-unit-badge">{problem.unit}</span>
                        </div>
                        <div className="owner-meta-item">
                          <Calendar size={14} />
                          <span>{problem.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="owner-notification-actions">
                    <div className={`owner-status-badge status-${problem.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(problem.status)}
                      {problem.status}
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
                      <button className="owner-arrow-btn">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Problem Modal */}
      {showProblemModal && selectedProblem && (
        <div className="owner-problem-modal-overlay">
          <div className="owner-problem-modal">
            <div className="owner-problem-modal-header">
              <div className="owner-modal-title-section">
                <h3>{selectedProblem.title}</h3>
                <div className="owner-modal-badges">
                  <span className={`owner-status-badge status-${selectedProblem.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(selectedProblem.status)}
                    {selectedProblem.status}
                  </span>
                </div>
              </div>
              <button 
                className="owner-close-btn" 
                onClick={() => setShowProblemModal(false)}
              >
                ×
              </button>
            </div>

            <div className="owner-problem-modal-body">
              <div className="owner-problem-details">
                <div className="owner-detail-grid">
                  <div className="owner-detail-item">
                    <label>Tenant Name</label>
                    <p>{selectedProblem.tenant}</p>
                  </div>
                  <div className="owner-detail-item">
                    <label>Unit</label>
                    <p>{selectedProblem.unit}</p>
                  </div>
                  <div className="owner-detail-item">
                    <label>Date Reported</label>
                    <p>{selectedProblem.date}</p>
                  </div>
                  <div className="owner-detail-item">
                    <label>Problem Type</label>
                    <p>{selectedProblem.type}</p>
                  </div>
                </div>

                <div className="owner-description-section">
                  <label>Problem Description</label>
                  <p>{selectedProblem.description}</p>
                </div>

                <div className="owner-problem-photo">
                  <label>Attached Photo</label>
                  <div className="owner-photo-container">
                    <img src={selectedProblem.image} alt={selectedProblem.title} />
                    <button className="owner-download-btn">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Only show update section if not resolved */}
              {selectedProblem.status !== "Resolved" && (
                <div className="owner-update-section">
                  <h4>Update Problem Status</h4>
                  <div className="owner-status-actions">
                    <button
                      className="owner-status-btn progress"
                      onClick={() => handleUpdateStatus("In Progress")}
                    >
                      <AlertCircle size={16} />
                      Mark In Progress
                    </button>
                    <button
                      className="owner-status-btn resolved"
                      onClick={() => handleUpdateStatus("Resolved")}
                    >
                      <CheckCircle size={16} />
                      Mark Resolved
                    </button>
                  </div>

                  <div className="owner-update-form">
                    <label htmlFor="update-notes">
                      <MessageCircle size={16} />
                      Additional Notes
                    </label>
                    <textarea
                      id="update-notes"
                      placeholder="Add updates, notes, or instructions for the tenant..."
                      rows="4"
                    ></textarea>

                    <label htmlFor="update-photo">
                      <Download size={16} />
                      Upload Update Photo
                    </label>
                    <input 
                      type="file" 
                      id="update-photo" 
                      accept="image/*" 
                      className="owner-file-input"
                    />

                    <button className="owner-send-update-btn">
                      <MessageCircle size={16} />
                      Send Update to Tenant
                    </button>
                  </div>
                </div>
              )}

              {/* Show resolved message if status is resolved */}
              {selectedProblem.status === "Resolved" && (
                <div className="owner-resolved-message">
                  <CheckCircle size={24} className="resolved-check-icon" />
                  <h4>Issue Resolved</h4>
                  <p>This maintenance issue has been successfully resolved and is now complete.</p>
                </div>
              )}
            </div>

            <div className="owner-problem-modal-footer">
              <div className="owner-footer-actions">
                {selectedProblem.status === "Resolved" && (
                  <button 
                    className="owner-delete-modal-btn"
                    onClick={() => handleDeleteClick(selectedProblem)}
                  >
                    <Trash2 size={16} />
                    Delete Resolved Issue
                  </button>
                )}
                <button
                  className="owner-close-modal-btn"
                  onClick={() => setShowProblemModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && problemToDelete && (
        <div className="owner-delete-modal-overlay">
          <div className="owner-delete-modal">
            <div className="owner-delete-modal-icon">
              <Trash2 size={48} />
            </div>
            <div className="owner-delete-modal-content">
              <h3>Delete Resolved Issue?</h3>
              <p>Are you sure you want to delete this resolved maintenance issue? This action cannot be undone.</p>
              <div className="owner-delete-modal-details">
                <p><strong>Issue:</strong> {problemToDelete.title}</p>
                <p><strong>Tenant:</strong> {problemToDelete.tenant}</p>
                <p><strong>Unit:</strong> {problemToDelete.unit}</p>
              </div>
            </div>
            <div className="owner-delete-modal-actions">
              <button 
                className="owner-delete-cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="owner-delete-confirm-btn"
                onClick={confirmDelete}
              >
                Yes, Delete Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;