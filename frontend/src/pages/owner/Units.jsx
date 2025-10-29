import React, { useState, useEffect } from "react";
import { Home, DollarSign, Plus, X, MapPin, Users, Calendar } from "lucide-react";
import "../../styles/owners/Units.css";

function Units() {
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    status: "Available",
    image: null,
  });

  const API_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
    "http://localhost:5000";

  // ✅ Fetch all units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/houses`);
        const data = await response.json();
        setUnits(data);
      } catch (err) {
        console.error("Error fetching units:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [API_URL]);

  // ✅ Handle form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image selection (only 1 image allowed)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ✅ Add new unit
  const handleAddUnit = async () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill in all required fields and select an image.");
      return;
    }

    const newFormData = new FormData();
    newFormData.append("name", formData.name);
    newFormData.append("description", formData.description);
    newFormData.append("price", formData.price);
    newFormData.append("status", formData.status);
    newFormData.append("image", formData.image);

    try {
      const response = await fetch(`${API_URL}/api/add-houses`, {
        method: "POST",
        body: newFormData,
      });

      if (response.ok) {
        alert("Unit added successfully!");
        setShowAddModal(false);
        setPreviewImage(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          status: "Available",
          image: null,
        });

        // Refresh units
        const updatedUnits = await fetch(`${API_URL}/api/houses`).then((res) =>
          res.json()
        );
        setUnits(updatedUnits);
      } else {
        alert("Failed to add unit.");
      }
    } catch (err) {
      console.error("Error adding unit:", err);
      alert("Error adding unit.");
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setPreviewImage(null);
    setSelectedUnit(null);
  };

  // ✅ Filter units by status
  const filteredUnits =
    activeTab === "All"
      ? units
      : units.filter(
        (unit) => unit.status.toLowerCase() === activeTab.toLowerCase()
      );

  // ✅ Get stats for badges
  const getStats = () => {
    const total = units.length;
    const available = units.filter(unit => unit.status.toLowerCase() === 'available').length;
    const occupied = units.filter(unit => unit.status.toLowerCase() === 'occupied').length;
    
    return { total, available, occupied };
  };

  const stats = getStats();

  return (
    <div className="Owner-Units-container">
      {/* --- Header Section --- */}
      <div className="Owner-Units-header">
        <div className="Owner-Units-header-content">
          <h1 className="Owner-Units-title">Property Units</h1>
          <p className="Owner-Units-subtitle">Manage your rental properties and units</p>
        </div>
        <div className="Owner-Units-stats">
          <div className="Owner-Units-stat-card">
            <div className="Owner-Units-stat-icon total">
              <Home size={20} />
            </div>
            <div className="Owner-Units-stat-info">
              <span className="Owner-Units-stat-number">{stats.total}</span>
              <span className="Owner-Units-stat-label">Total Units</span>
            </div>
          </div>
          <div className="Owner-Units-stat-card">
            <div className="Owner-Units-stat-icon available">
              <Users size={20} />
            </div>
            <div className="Owner-Units-stat-info">
              <span className="Owner-Units-stat-number">{stats.available}</span>
              <span className="Owner-Units-stat-label">Available</span>
            </div>
          </div>
          <div className="Owner-Units-stat-card">
            <div className="Owner-Units-stat-icon occupied">
              <Calendar size={20} />
            </div>
            <div className="Owner-Units-stat-info">
              <span className="Owner-Units-stat-number">{stats.occupied}</span>
              <span className="Owner-Units-stat-label">Occupied</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Top Controls --- */}
      <div className="Owner-Units-control-bar">
        <div className="Owner-Units-tab-group">
          {["All", "Available", "Occupied"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`Owner-Units-tab-btn ${activeTab === tab ? "Owner-Units-tab-active" : ""}`}
            >
              {tab}
              {tab === "All" && <span className="Owner-Units-tab-badge">{stats.total}</span>}
              {tab === "Available" && <span className="Owner-Units-tab-badge">{stats.available}</span>}
              {tab === "Occupied" && <span className="Owner-Units-tab-badge">{stats.occupied}</span>}
            </button>
          ))}
        </div>

        <button className="Owner-Units-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add New Unit
        </button>
      </div>

      {/* --- Units Grid --- */}
      {loading ? (
        <div className="Owner-Units-loading">
          <div className="Owner-Units-loading-spinner"></div>
          <p>Loading units...</p>
        </div>
      ) : (
        <div className="Owner-Units-grid">
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => (
              <div key={unit.unitid} className="Owner-Units-card">
                <div className="Owner-Units-image-container">
                  {unit.imagepath ? (
                    <img
                      src={`${API_URL}/uploads/houseimages/${unit.imagepath}`}
                      alt={unit.name}
                      className="Owner-Units-thumbnail"
                    />
                  ) : (
                    <div className="Owner-Units-image-placeholder">
                      <Home size={32} className="Owner-Units-placeholder-icon" />
                    </div>
                  )}
                  <div className="Owner-Units-image-overlay">
                    <span className={`Owner-Units-status-badge ${unit.status.toLowerCase()}`}>
                      {unit.status}
                    </span>
                    <span className="Owner-Units-name-tag">{unit.name}</span>
                  </div>
                </div>

                <div className="Owner-Units-card-content">
                  <h3 className="Owner-Units-card-title">{unit.name}</h3>
                  <p className="Owner-Units-card-description">
                    {unit.description || "No description available"}
                  </p>
                  
                  <div className="Owner-Units-price-section">
                    <DollarSign size={18} className="Owner-Units-price-icon" />
                    <span className="Owner-Units-price">
                      ₱{Number(unit.price).toLocaleString()}
                    </span>
                    <span className="Owner-Units-price-period">/month</span>
                  </div>

                  <button
                    className="Owner-Units-view-btn"
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
            <div className="Owner-Units-empty">
              <Home size={48} className="Owner-Units-empty-icon" />
              <h3>No units found</h3>
              <p>There are no units matching your current filter.</p>
            </div>
          )}
        </div>
      )}

      {/* --- Add Unit Modal --- */}
      {showAddModal && (
        <div className="Owner-Units-modal-overlay">
          <div className="Owner-Units-modal Owner-Units-add-modal">
            <div className="Owner-Units-modal-header">
              <h3>Add New Unit</h3>
              <button className="Owner-Units-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="Owner-Units-modal-body">
              <div className="Owner-Units-form-group">
                <label className="Owner-Units-form-label">Unit Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Unit 101 - Studio"
                  className="Owner-Units-form-input"
                />
              </div>

              <div className="Owner-Units-form-group">
                <label className="Owner-Units-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Spacious studio with balcony and city view..."
                  className="Owner-Units-form-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div className="Owner-Units-form-row">
                <div className="Owner-Units-form-group">
                  <label className="Owner-Units-form-label">Price (₱) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="15000"
                    className="Owner-Units-form-input"
                  />
                </div>

                <div className="Owner-Units-form-group">
                  <label className="Owner-Units-form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="Owner-Units-form-select"
                  >
                    <option>Available</option>
                    <option>Occupied</option>
                  </select>
                </div>
              </div>

              <div className="Owner-Units-form-group">
                <label className="Owner-Units-form-label">Unit Image *</label>
                <div className="Owner-Units-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="Owner-Units-file-input"
                  />
                  <div className="Owner-Units-file-label">
                    <Plus size={16} />
                    Choose Image
                  </div>
                </div>
                
                {previewImage && (
                  <div className="Owner-Units-preview-container">
                    <img src={previewImage} alt="Preview" className="Owner-Units-preview-image" />
                  </div>
                )}
              </div>
            </div>

            <div className="Owner-Units-modal-footer">
              <button className="Owner-Units-cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="Owner-Units-save-btn" onClick={handleAddUnit}>
                Save Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Details Modal --- */}
      {showViewModal && selectedUnit && (
        <div className="Owner-Units-modal-overlay">
          <div className="Owner-Units-modal Owner-Units-view-modal">
            <div className="Owner-Units-modal-header">
              <h3>Unit Details</h3>
              <button className="Owner-Units-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="Owner-Units-modal-body">
              <div className="Owner-Units-detail-image">
                {selectedUnit.imagepath ? (
                  <img
                    src={`${API_URL}/uploads/houseimages/${selectedUnit.imagepath}`}
                    alt={selectedUnit.name}
                    className="Owner-Units-detail-thumbnail"
                  />
                ) : (
                  <div className="Owner-Units-detail-placeholder">
                    <Home size={48} className="Owner-Units-detail-icon" />
                    <p>No Image Available</p>
                  </div>
                )}
              </div>

              <div className="Owner-Units-detail-info">
                <div className="Owner-Units-detail-row">
                  <span className="Owner-Units-detail-label">Unit Name</span>
                  <span className="Owner-Units-detail-value">{selectedUnit.name}</span>
                </div>
                
                <div className="Owner-Units-detail-row">
                  <span className="Owner-Units-detail-label">Description</span>
                  <span className="Owner-Units-detail-value">
                    {selectedUnit.description || "No description provided"}
                  </span>
                </div>
                
                <div className="Owner-Units-detail-row">
                  <span className="Owner-Units-detail-label">Monthly Price</span>
                  <span className="Owner-Units-detail-value Owner-Units-detail-price">
                    ₱{Number(selectedUnit.price).toLocaleString()}
                  </span>
                </div>
                
                <div className="Owner-Units-detail-row">
                  <span className="Owner-Units-detail-label">Status</span>
                  <span className={`Owner-Units-detail-status ${selectedUnit.status.toLowerCase()}`}>
                    {selectedUnit.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="Owner-Units-modal-footer">
              <button className="Owner-Units-close-detail-btn" onClick={handleCloseModal}>
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