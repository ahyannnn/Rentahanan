import React, { useState, useEffect } from "react";
import { Home, DollarSign, Plus, X, Image as ImageIcon } from "lucide-react";
import "../../styles/owners/Units.css";

function Units() {
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // ✅ Deployment-friendly API URL
  const API_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
    "http://localhost:5000";

  // ✅ Fetch all houses
  useEffect(() => {
    fetch(`${API_URL}/api/houses`)
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch((err) => console.error("Error fetching units:", err));
  }, []);

  // --- handle upload preview (limit to 4)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setPreviewImages([]);
    setSelectedUnit(null);
  };

  // --- filter units by tab
  const filteredUnits =
    activeTab === "All"
      ? units
      : units.filter(
          (unit) => unit.status.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <div className="units-page-container">
      {/* --- Top Controls --- */}
      <div className="control-bar">
        <div className="tab-group">
          {["All", "Available", "Occupied"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="add-unit-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Unit
        </button>
      </div>

      {/* --- Units Grid (Dynamic) --- */}
      <div className="units-grid small">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit, index) => (
            <div key={unit.id} className="unit-card small">
              <div className="unit-image-placeholder small">
                <Home size={32} className="unit-icon" />
                <div className="unit-name-tag small">{unit.name}</div>
              </div>

              <div className="unit-details small">
                <span
                  className={`status-badge ${
                    unit.status.toLowerCase() === "available"
                      ? "status-available"
                      : "status-occupied"
                  }`}
                >
                  {unit.status}
                </span>
                <p className="unit-price-block">
                  <DollarSign size={16} className="info-icon price-icon" />
                  <span className="unit-price">
                    {unit.price?.toLocaleString()}
                  </span>
                  <span className="unit-price-suffix">/month</span>
                </p>
                <button
                  className="view-details-btn small"
                  onClick={() => {
                    setSelectedUnit(unit);
                    setShowViewModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-units-text">No units found.</p>
        )}
      </div>

      {/* --- Add Unit Modal --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-unit-modal">
            <div className="modal-header">
              <h3>Add New Unit</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <label>Unit Name</label>
              <input type="text" placeholder="e.g. Unit 101 - Studio" />

              <label>Price (₱)</label>
              <input type="number" placeholder="e.g. 15000" />

              <label>Status</label>
              <select>
                <option>Available</option>
                <option>Occupied</option>
              </select>

              <label>Upload Photos (Max: 4)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />

              <div className="preview-container">
                {previewImages.map((src, index) => (
                  <img key={index} src={src} alt={`Preview ${index + 1}`} />
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="save-btn">Save</button>
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Details Modal --- */}
      {showViewModal && selectedUnit && (
        <div className="modal-overlay">
          <div className="view-details-modal">
            <div className="modal-header">
              <h3>Unit Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="unit-info">
                <p>
                  <strong>Name:</strong> {selectedUnit.name}
                </p>
                <p>
                  <strong>Price:</strong> ₱
                  {selectedUnit.price?.toLocaleString()} / month
                </p>
                <p>
                  <strong>Status:</strong> {selectedUnit.status}
                </p>
              </div>

              <div className="photo-gallery">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="photo-box">
                    <ImageIcon size={30} />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Units;
