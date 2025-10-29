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

  // Get the whole user object from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const tenantId = storedUser.userid; // ✅ Now this will be correct

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
        const res = await fetch(`http://localhost:5000/api/application/${tenantId}`);
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
  console.log(tenantId)
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

  // Calculate stats from actual data
  const statsData = {
    total: units.length,
    available: units.filter(unit => unit.status === "Available").length,
    occupied: units.filter(unit => unit.status === "Occupied").length
  };

  return (
    <div className="browse-units-container-Browse">
      {/* Header Section */}
      <div className="page-header-section-Browse">
        <h2 className="page-header-Browse">Browse Units 🏘️</h2>
        <p className="page-subtext-Browse">Discover available rental units that match your lifestyle and budget</p>

        {/* Stats Cards */}
        <div className="stats-container-Browse">
          <div className="stat-card-Browse">
            <div className="stat-number-Browse">{statsData.total}</div>
            <div className="stat-label-Browse">Total Units</div>
          </div>
          <div className="stat-card-Browse">
            <div className="stat-number-Browse">{statsData.available}</div>
            <div className="stat-label-Browse">Available</div>
          </div>
          <div className="stat-card-Browse">
            <div className="stat-number-Browse">{statsData.occupied}</div>
            <div className="stat-label-Browse">Occupied</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="controls-container-Browse">
        <div className="search-container-Browse">
          <div className="search-box-Browse">
            <i className="search-icon-Browse">🔍</i>
            <input
              type="text"
              placeholder="Search by unit name, description, or features..."
              className="search-input-Browse"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="status-filters-container-Browse">
          <div className="status-filters-Browse">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`filter-btn-Browse ${filterStatus === status ? "filter-btn-active-Browse" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status} {status === "All" ? "" : units.filter(unit =>
                  status === "All" ? true : unit.status === status
                ).length}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Units Grid Section */}
      <div className="units-grid-container-Browse">
        <h2 className="section-title-Browse">Available Properties</h2>

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
                    <div className="unit-image-placeholder-Browse">
                      <div className="placeholder-icon-Browse">🏠</div>
                      <span>No Image Available</span>
                    </div>
                  )}
                  <div className={`unit-status-Browse unit-status-${unit.status.toLowerCase()}-Browse`}>
                    {unit.status}
                  </div>
                </div>

                <div className="unit-info-Browse">
                  <h3 className="unit-name-Browse">{unit.name}</h3>
                  <p className="unit-price-Browse">₱{unit.price?.toLocaleString() || '0'} / month</p>
                  <p className="unit-description-Browse">{unit.description}</p>

                  <div className="unit-features-Browse">
                    {unit.features && unit.features.split(',').map((feature, index) => (
                      <span key={index} className="feature-tag-Browse">
                        {feature.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-container-Browse">
              <div className="no-results-icon-Browse">😟</div>
              <p className="no-results-Browse">No units found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && !showApplyForm && (
        <div className="modal-overlay-Browse" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content-Browse" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-Browse" onClick={() => setSelectedUnit(null)}>×</button>

            <div className="modal-image-container-Browse">
              {selectedUnit.imagepath ? (
                <img
                  src={`http://localhost:5000/uploads/houseimages/${selectedUnit.imagepath}`}
                  alt={selectedUnit.name}
                  className="modal-image-Browse"
                />
              ) : (
                <div className="modal-image-placeholder-Browse">
                  <div className="placeholder-icon-Browse">🏠</div>
                  <span>No Image Available</span>
                </div>
              )}
            </div>

            <div className="modal-header-Browse">
              <h2 className="modal-title-Browse">{selectedUnit.name}</h2>
              <div className={`unit-status-Browse unit-status-${selectedUnit.status.toLowerCase()}-Browse`}>
                {selectedUnit.status}
              </div>
            </div>

            <div className="modal-details-Browse">
              <div className="detail-item-Browse">
                <span className="detail-label-Browse">Price:</span>
                <span className="detail-price-Browse">₱{selectedUnit.price?.toLocaleString() || '0'} / month</span>
              </div>

              <div className="detail-item-Browse">
                <span className="detail-label-Browse">Description:</span>
                <p className="detail-description-Browse">{selectedUnit.description}</p>
              </div>

              {selectedUnit.features && (
                <div className="detail-item-Browse">
                  <span className="detail-label-Browse">Features:</span>
                  <div className="features-list-Browse">
                    {selectedUnit.features.split(',').map((feature, index) => (
                      <span key={index} className="feature-tag-Browse">
                        {feature.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
            <button className="close-btn-Browse" onClick={() => setShowApplyForm(false)}>×</button>

            <div className="form-header-Browse">
              <h2 className="form-title-Browse">Application for {selectedUnit.name}</h2>
              <p className="form-subtitle-Browse">Please fill out the application form below</p>
            </div>

            <form className="application-form-Browse" onSubmit={handleFormSubmit}>
              <div className="form-section-Browse">
                <h3 className="form-section-title-Browse">Personal Information</h3>

                <div className="form-row-Browse">
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
              </div>

              <div className="form-section-Browse">
                <h3 className="form-section-title-Browse">Required Documents</h3>
                <p className="form-help-text-Browse">Please upload clear photos or scans of the following documents:</p>

                <div className="form-field-Browse">
                  <label className="form-label-Browse">Valid ID (Government Issued):</label>
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