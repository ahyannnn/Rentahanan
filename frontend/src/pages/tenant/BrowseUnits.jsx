import React, { useEffect, useState, useMemo } from "react";
import "../../styles/tenant/BrowseUnits.css";

const BrowseUnits = () => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [application, setApplication] = useState({});
  const [hasApplied, setHasApplied] = useState(false);

  const tenantId = localStorage.getItem("userId");
  const statusOptions = ["All", "Available", "Occupied", "Pending"];

  // 1. Fetch all units on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/houses")
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch((err) => console.error("Error fetching units:", err));
  }, []);

  // 2. Fetch tenant application status
  useEffect(() => {
    if (!tenantId) return;

    const fetchApplication = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/application/${tenantId}`);

        if (res.ok) {
          const data = await res.json();
          setHasApplied(!!data.unitid);
          setApplication(data);
        } else if (res.status === 404) {
          setHasApplied(false);
          setApplication({});
        } else {
          console.error("Unexpected response status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching tenant application:", err);
      }
    };

    fetchApplication();
  }, [tenantId]);

  // 3. Combined search and filter logic
  const filteredUnits = useMemo(() => {
    const statusMap = {
      "All": () => true,
      "Available": (unit) => unit.status === "Available",
      "Occupied": (unit) => unit.status === "Occupied",
      "Pending": (unit) => unit.status === "Pending",
    };

    return units.filter((unit) => {
      const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusMap[filterStatus](unit);

      return matchesSearch && matchesStatus;
    });
  }, [units, searchTerm, filterStatus]);

  const handleApply = () => setShowApplyForm(true);

  // 4. Handle form submission (API call with FormData)
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!selectedUnit || hasApplied) {
      alert("Cannot apply. You have either not selected a unit or have already applied.");
      return;
    }

    const validIdFile = document.querySelector('input[name="validId"]').files[0];
    const brgyClearanceFile = document.querySelector('input[name="brgyClearance"]').files[0];
    const proofOfIncomeFile = document.querySelector('input[name="proofOfIncome"]').files[0];

    if (!validIdFile || !brgyClearanceFile || !proofOfIncomeFile) {
      alert("All required documents must be uploaded.");
      return;
    }
    // Assuming file type validation is handled on the backend for simplicity here

    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("unit_id", selectedUnit.id);
    formData.append("validId", validIdFile);
    formData.append("brgyClearance", brgyClearanceFile);
    formData.append("proofOfIncome", proofOfIncomeFile);

    fetch("http://localhost:5000/api/apply", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Application submitted successfully! Please wait for approval.");
        setShowApplyForm(false);
        setSelectedUnit(null);
        setHasApplied(true); // Optimistically update
      })
      .catch((err) => {
        console.error("Error submitting application:", err);
        alert("Failed to submit application.");
      });
  };


  return (
    <div className="browse-units-container">
      <h2 className="page-header">Browse Units 🏘️</h2>
      <p className="page-subtext">Explore available units and find the one that fits your needs.</p>


      {/* --- Search and Filter Controls --- */}
      <div className="controls-container">

        <div className="status-filters">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search units by name or description..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* --- End Controls --- */}

      {/* --- Units Grid/List Display --- */}
      <div className="units-grid">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="unit-card"
              onClick={() => setSelectedUnit(unit)}
            >
              {unit.imagepath ? (
                <img
                  src={`http://localhost:5000/uploads/houseimages/${unit.imagepath}`}
                  alt={unit.name}
                  className="unit-image"
                />
              ) : (
                <div className="unit-image-placeholder">No Image</div>
              )}
              <div className="unit-info">
                <h3 className="unit-name">{unit.name}</h3>
                <p className="unit-price">₱{unit.price.toLocaleString()} / month</p>
                <span className={`unit-status ${unit.status.toLowerCase()}`}>
                  {unit.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No units found matching your criteria. 😟</p>
        )}
      </div>
      {/* --- End Units Grid --- */}

      {/* Unit Detail Modal */}
      {selectedUnit && !showApplyForm && (
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            {/* Unit Image Display */}
            {selectedUnit.imagepath ? (
              <img
                src={`http://localhost:5000/uploads/houseimages/${selectedUnit.imagepath}`}
                alt={selectedUnit.name}
                className="modal-image"
              />
            ) : (
              <div className="unit-image-placeholder modal-placeholder">
                No Image Available
              </div>
            )}

            <h2>{selectedUnit.name}</h2>
            <p className="detail-price">
              <strong>₱{selectedUnit.price.toLocaleString()}</strong> / month
            </p>
            <p>{selectedUnit.description}</p>
            <p>
              Status: <span className={`unit-status ${selectedUnit.status.toLowerCase()}`}>{selectedUnit.status}</span>
            </p>

            <button
              className="apply-btn"
              disabled={hasApplied || selectedUnit.status.toLowerCase() !== "available"}
              onClick={handleApply}
            >
              {selectedUnit.status.toLowerCase() !== "available"
                ? selectedUnit.status === "Occupied" ? "Not Available" : `Status: ${selectedUnit.status}`
                : hasApplied
                  ? "Already Applied"
                  : "Apply Now"}
            </button>
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {selectedUnit && showApplyForm && (
        <div className="modal-overlay" onClick={() => setShowApplyForm(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Application for {selectedUnit.name}</h2>
            <form onSubmit={handleFormSubmit}>
              <label>Full Name:
                <input type="text" name="fullName" value={application.fullName || ""} readOnly required /></label>
              <label>Email:
                <input type="email" name="email" value={application.email || ""} readOnly required /></label>
              <label>Phone Number:
                <input type="tel" name="phone" value={application.phone || ""} readOnly required /></label>
              <label>Valid ID:
                <input type="file" name="validId" accept="image/*,.pdf" required /></label>
              <label>Barangay Clearance:
                <input type="file" name="brgyClearance" accept="image/*,.pdf" required /></label>
              <label>Proof of Income:
                <input type="file" name="proofOfIncome" accept="image/*,.pdf" required /></label>

              <div className="form-buttons">
                <button type="submit">Submit Application</button>
                <button type="button" onClick={() => setShowApplyForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseUnits;