import React, { useState } from "react";
import { Search, ChevronRight, User, Calendar, Wrench } from "lucide-react";
import "../../styles/owners/Notification.css";

function Notification() {
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // Dummy data inline (no const array)
  const openProblemModal = (problem) => {
    setSelectedProblem(problem);
    setShowProblemModal(true);
  };

  return (
    <div className="notifications-page-container">
      {/* Header */}
      <div className="content-card header-card">
        <h2>Tenant Problems</h2>
        <p>View all maintenance issues reported by tenants.</p>
      </div>

      {/* Main Notification Area */}
      <div className="content-card notification-list-area">
        {/* Control Bar */}
        <div className="notification-control-bar">
          <select className="filter-dropdown">
            <option value="All">All Problems</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search problem..." />
          </div>
        </div>

        {/* Dummy Problem Cards */}
        <div className="notification-list-wrapper">
          {/* Problem 1 */}
          <div className="notification-item status-pending">
            <div className="item-header">
              <Wrench size={20} className="notif-icon" />
              <span className="notif-category">Maintenance</span>
              <span className="notif-title">Water leakage in the unit</span>
              <button
                className="arrow-btn"
                onClick={() =>
                  openProblemModal({
                    tenant: "Juan Dela Cruz",
                    unit: "A-2B",
                    date: "2025-10-15",
                    type: "Water Leak",
                    description:
                      "May tumatagas sa ceiling ng bathroom kapag malakas ulan.",
                    image:
                      "https://via.placeholder.com/400x250?text=Water+Leak+Problem",
                    title: "Water leakage in the unit",
                    status: "Pending",
                  })
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="item-details">
              <p>
                <User size={14} /> Tenant: <span>Juan Dela Cruz</span>
              </p>
              <p>
                <Calendar size={14} /> Date: <span>2025-10-15</span>
              </p>
              <p>
                Status: <span className="status-badge pending">Pending</span>
              </p>
            </div>
          </div>

          {/* Problem 2 */}
          <div className="notification-item status-progress">
            <div className="item-header">
              <Wrench size={20} className="notif-icon" />
              <span className="notif-category">Maintenance</span>
              <span className="notif-title">Broken door lock</span>
              <button
                className="arrow-btn"
                onClick={() =>
                  openProblemModal({
                    tenant: "Maria Santos",
                    unit: "B-3A",
                    date: "2025-10-10",
                    type: "Lock Issue",
                    description:
                      "Hindi naisasara nang maayos ang pinto ng kwarto.",
                    image:
                      "https://via.placeholder.com/400x250?text=Broken+Door+Lock",
                    title: "Broken door lock",
                    status: "In Progress",
                  })
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="item-details">
              <p>
                <User size={14} /> Tenant: <span>Maria Santos</span>
              </p>
              <p>
                <Calendar size={14} /> Date: <span>2025-10-10</span>
              </p>
              <p>
                Status: <span className="status-badge progress">In Progress</span>
              </p>
            </div>
          </div>

          {/* Problem 3 */}
          <div className="notification-item status-resolved">
            <div className="item-header">
              <Wrench size={20} className="notif-icon" />
              <span className="notif-category">Maintenance</span>
              <span className="notif-title">No electricity in kitchen</span>
              <button
                className="arrow-btn"
                onClick={() =>
                  openProblemModal({
                    tenant: "Carlos Reyes",
                    unit: "C-1C",
                    date: "2025-10-08",
                    type: "Electrical",
                    description:
                      "Walang kuryente sa kitchen area simula kagabi.",
                    image:
                      "https://via.placeholder.com/400x250?text=No+Electricity+in+Kitchen",
                    title: "No electricity in kitchen",
                    status: "Resolved",
                  })
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="item-details">
              <p>
                <User size={14} /> Tenant: <span>Carlos Reyes</span>
              </p>
              <p>
                <Calendar size={14} /> Date: <span>2025-10-08</span>
              </p>
              <p>
                Status: <span className="status-badge resolved">Resolved</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal (lumalabas pag pindot ng arrow) */}
        {showProblemModal && selectedProblem && (
          <div className="problem-modal-overlay">
            <div className="problem-modal">
              <div className="problem-modal-header">
                <h3>{selectedProblem.title}</h3>
                <button className="close-btn" onClick={() => setShowProblemModal(false)}>
                  ×
                </button>
              </div>

              <div className="problem-modal-body">
                <div className="problem-info">
                  <p><strong>Tenant Name:</strong> {selectedProblem.tenant}</p>
                  <p><strong>Unit:</strong> {selectedProblem.unit}</p>
                  <p><strong>Date Reported:</strong> {selectedProblem.date}</p>
                  <p><strong>Problem Type:</strong> {selectedProblem.type}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status-badge ${selectedProblem.status.toLowerCase()}`}>
                      {selectedProblem.status}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {selectedProblem.description}</p>
                </div>

                <div className="problem-photo">
                  <img src={selectedProblem.image} alt={selectedProblem.title} />
                </div>

                {/* 🧾 Upload + Remarks Section */}
                <div className="problem-update-section">
                  <label htmlFor="update-photo"><strong>Upload Proof Photo:</strong></label>
                  <input type="file" id="update-photo" accept="image/*" />

                  <label htmlFor="update-description"><strong>Additional Notes:</strong></label>
                  <textarea
                    id="update-description"
                    placeholder="Write a short remark or update..."
                  ></textarea>

                  {/* ✅ Send Button */}
                  <button className="send-btn">Send Update</button>
                </div>
              </div>

              <div className="problem-modal-footer">
                <div className="status-actions">
                  <button
                    className="status-btn progress"
                    onClick={() =>
                      setSelectedProblem({ ...selectedProblem, status: "In Progress" })
                    }
                  >
                    Mark as In Progress
                  </button>
                  <button
                    className="status-btn resolved"
                    onClick={() =>
                      setSelectedProblem({ ...selectedProblem, status: "Resolved" })
                    }
                  >
                    Mark as Resolved
                  </button>
                </div>

                <button
                  className="close-btn-2"
                  onClick={() => setShowProblemModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;
