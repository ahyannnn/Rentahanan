import React, { useEffect, useState, useMemo } from "react";
import "../../styles/tenant/BrowseUnits.css";

const BrowseUnits = () => {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [hasApplied, setHasApplied] = useState(false);
  const [tenantDetails, setTenantDetails] = useState({}); 

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
          setHasApplied(!!data.unit_id);
          setApplicationStatus(data);
        } else if (res.status === 404) {
          setHasApplied(false);
          setApplicationStatus({});
        } else {
          console.error("Unexpected response status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching tenant application:", err);
      }
    };

    fetchApplication();
  }, [tenantId]);

  // 3. Fetch tenant details for form pre-filling
  useEffect(() => {
    if (!tenantId) return;

    const fetchTenantDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tenant/${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setTenantDetails(data);
        } else {
          console.error("Failed to fetch tenant details:", res.status);
        }
      } catch (err) {
        console.error("Error fetching tenant details:", err);
      }
    };

    fetchTenantDetails();
  }, [tenantId]);

  // 4. Combined search and filter logic
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

  // 5. Handle form submission
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
        setHasApplied(true);
      })
      .catch((err) => {
        console.error("Error submitting application:", err);
        alert("Failed to submit application.");
      });
  };

  return (
    <div className="browse-units-container-Browse">
      <div className="page-header-section-Browse">
        <h2 className="page-header-Browse">Browse Units 🏘️</h2>
        <p className="page-subtext-Browse">Explore available units and find the one that fits your needs.</p>
      </div>

      {/* --- Search and Filter Controls --- */}
      <div className="controls-container-Browse">
        <div className="status-filters-container-Browse">
          <div className="status-filters-Browse">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`filter-btn-Browse ${filterStatus === status ? "filter-btn-active-Browse" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="search-container-Browse">
          <input
            type="text"
            placeholder="Search units by name or description..."
            className="search-input-Browse"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Units Grid Display --- */}
      <div className="units-grid-container-Browse">
        <div className="units-grid-Browse">
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="unit-card-Browse"
                onClick={() => setSelectedUnit(unit)}
              >
                <div className="unit-image-container-Browse">
                  {unit.imagepath ? (
                    <img
                      src={`http://localhost:5000/uploads/houseimages/${unit.imagepath}`}
                      alt={unit.name}
                      className="unit-image-Browse"
                    />
                  ) : (
                    <div className="unit-image-placeholder-Browse">No Image</div>
                  )}
                </div>
                <div className="unit-info-Browse">
                  <h3 className="unit-name-Browse">{unit.name}</h3>
                  <p className="unit-price-Browse">₱{unit.price.toLocaleString()} / month</p>
                  <span className={`unit-status-Browse unit-status-${unit.status.toLowerCase()}-Browse`}>
                    {unit.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-container-Browse">
              <p className="no-results-Browse">No units found matching your criteria. 😟</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && !showApplyForm && (
        <div className="modal-overlay-Browse" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content-Browse" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-container-Browse">
              {selectedUnit.imagepath ? (
                <img
                  src={`http://localhost:5000/uploads/houseimages/${selectedUnit.imagepath}`}
                  alt={selectedUnit.name}
                  className="modal-image-Browse"
                />
              ) : (
                <div className="modal-image-placeholder-Browse">
                  No Image Available
                </div>
              )}
            </div>
            
            <div className="modal-header-Browse">
              <h2 className="modal-title-Browse">{selectedUnit.name}</h2>
            </div>
            
            <div className="modal-details-Browse">
              <p className="detail-price-Browse">
                <strong>₱{selectedUnit.price.toLocaleString()}</strong> / month
              </p>
              <p className="detail-description-Browse">{selectedUnit.description}</p>
              <div className="detail-status-container-Browse">
                <span className="detail-status-label-Browse">Status: </span>
                <span className={`unit-status-Browse unit-status-${selectedUnit.status.toLowerCase()}-Browse`}>
                  {selectedUnit.status}
                </span>
              </div>
            </div>

            <div className="modal-actions-Browse">
              <button
                className="apply-btn-Browse"
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
        </div>
      )}

      {/* Apply Form Modal */}
      {selectedUnit && showApplyForm && (
        <div className="modal-overlay-Browse" onClick={() => setShowApplyForm(false)}>
          <div className="modal-content-Browse form-modal-Browse" onClick={(e) => e.stopPropagation()}>
            <div className="form-header-Browse">
              <h2 className="form-title-Browse">Application for {selectedUnit.name}</h2>
            </div>
            
            <form className="application-form-Browse" onSubmit={handleFormSubmit}>
              <div className="form-field-Browse">
                <label className="form-label-Browse">Full Name:</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-input-Browse form-input-readonly-Browse"
                  value={tenantDetails.fullName || ""} 
                  readOnly 
                  required 
                />
              </div>
              
              <div className="form-field-Browse">
                <label className="form-label-Browse">Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-input-Browse form-input-readonly-Browse"
                  value={tenantDetails.email || ""} 
                  readOnly 
                  required 
                />
              </div>
              
              <div className="form-field-Browse">
                <label className="form-label-Browse">Phone Number:</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="form-input-Browse form-input-readonly-Browse"
                  value={tenantDetails.phone || ""} 
                  readOnly 
                  required 
                />
              </div>
              
              <div className="form-field-Browse">
                <label className="form-label-Browse">Valid ID:</label>
                <input 
                  type="file" 
                  name="validId" 
                  className="form-file-input-Browse"
                  accept="image/*,.pdf" 
                  required 
                />
              </div>
              
              <div className="form-field-Browse">
                <label className="form-label-Browse">Barangay Clearance:</label>
                <input 
                  type="file" 
                  name="brgyClearance" 
                  className="form-file-input-Browse"
                  accept="image/*,.pdf" 
                  required 
                />
              </div>
              
              <div className="form-field-Browse">
                <label className="form-label-Browse">Proof of Income:</label>
                <input 
                  type="file" 
                  name="proofOfIncome" 
                  className="form-file-input-Browse"
                  accept="image/*,.pdf" 
                  required 
                />
              </div>

              <div className="form-buttons-container-Browse">
                <button type="submit" className="form-submit-btn-Browse">Submit Application</button>
                <button type="button" className="form-cancel-btn-Browse" onClick={() => setShowApplyForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseUnits;