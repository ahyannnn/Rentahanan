import React, { useState, useEffect } from "react";
import { Home, DollarSign, Plus, X } from "lucide-react";
import "../../styles/owners/Units.css";

function Units() {
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
    fetch(`${API_URL}/api/houses`)
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch((err) => console.error("Error fetching units:", err));
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

      {/* --- Units Grid --- */}
      <div className="units-grid small">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => (
            <div key={unit.unitid} className="unit-card small">
              <div className="unit-image-placeholder small">
                {unit.imagepath ? (
                  <div className="unit-image-placeholder small">
                    <img
                      src={`${API_URL}/uploads/houseimages/${unit.imagepath}`}
                      alt={unit.name}
                      className="unit-thumbnail"
                    />
                  </div>

                ) : (
                  <Home size={32} className="unit-icon" />
                )}
                <div className="unit-name-tag small">{unit.name}</div>
              </div>

              <div className="unit-details small">
                <span
                  className={`status-badge ${unit.status.toLowerCase() === "available"
                      ? "status-available"
                      : "status-occupied"
                    }`}
                >
                  {unit.status}
                </span>
                <p className="unit-price-block">
                  <DollarSign size={16} className="info-icon price-icon" />
                  <span className="unit-price">
                    {Number(unit.price).toLocaleString()}
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
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Unit 101 - Studio"
              />

              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. Spacious studio with balcony"
              ></textarea>

              <label>Price (₱)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 15000"
              />

              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option>Available</option>
                <option>Occupied</option>
              </select>

              <label>Upload Image (Only 1)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {previewImage && (
                <div className="preview-container">
                  <img src={previewImage} alt="Preview" />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={handleAddUnit}>
                Save
              </button>
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
                  <strong>Description:</strong> {selectedUnit.description}
                </p>
                <p>
                  <strong>Price:</strong> ₱
                  {Number(selectedUnit.price).toLocaleString()} / month
                </p>
                <p>
                  <strong>Status:</strong> {selectedUnit.status}
                </p>
              </div>

              {selectedUnit.imagepath && (
                <div className="photo-gallery">
                  <img
                    src={`${API_URL}/uploads/houseimages/${selectedUnit.imagepath}`}
                    alt={selectedUnit.name}
                    className="unit-full-image"
                  />
                </div>
              )}
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
