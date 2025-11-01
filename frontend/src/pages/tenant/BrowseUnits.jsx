import React, { useEffect, useState, useMemo } from "react";
import { Search, Home, DollarSign, Users, CheckCircle, X, Upload, FileText, User, Mail, Phone } from "lucide-react";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const tenantId = storedUser.userid;

  const statusOptions = ["All", "Available", "Occupied", "Pending"];

  useEffect(() => {
    fetch("http://localhost:5000/api/houses")
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch((err) => console.error("Error fetching units:", err));
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    const fetchApplication = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/application/${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          const shouldSetApplied = !!data.unitid;
          setHasApplied(shouldSetApplied);
          setApplicationStatus(data);
        } else if (res.status === 404) {
          setHasApplied(false);
          setApplicationStatus({});
        }
      } catch (err) {
        console.error("Error fetching tenant application:", err);
      }
    };

    fetchApplication();
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;

    const fetchTenantDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/application/${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setTenantDetails(data);
        }
      } catch (err) {
        console.error("Error fetching tenant details:", err);
      }
    };

    fetchTenantDetails();
  }, [tenantId]);

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
        setShowApplyForm(false);
        setShowSuccessModal(true);
        setHasApplied(true);
      })
      .catch((err) => {
        console.error("Error submitting application:", err);
        alert("Failed to submit application.");
      });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedUnit(null);
  };

  return (
    <div className="browse-units-container-Browse">
      {/* Header Section */}
      <div className="page-header-section-Browse">
        <div className="header-content-Browse">
          <h2 className="page-header-Browse">Browse Units 🏘️</h2>
          <p className="page-subtext-Browse">Discover available rental units that match your lifestyle and budget</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="controls-container-Browse">
        <div className="search-container-Browse">
          <div className="search-box-Browse">
            <Search size={20} className="search-icon-Browse" />
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
                {status}
                {status !== "All" && (
                  <span className="filter-count-Browse">
                    {units.filter(unit => unit.status === status).length}
                  </span>
                )}
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
                  <div className="unit-overlay-Browse">
                    <span className="view-details-Browse">View Details</span>
                  </div>
                </div>

                <div className="unit-info-Browse">
                  <div className="unit-header-Browse">
                    <h3 className="unit-name-Browse">{unit.name}</h3>
                    <div className="unit-price-Browse">
                      <DollarSign size={16} />
                      ₱{unit.price?.toLocaleString() || '0'}/month
                    </div>
                  </div>

                  <p className="unit-description-Browse">{unit.description}</p>

                  {unit.features && (
                    <div className="unit-features-Browse">
                      {unit.features.split(',').slice(0, 3).map((feature, index) => (
                        <span key={index} className="feature-tag-Browse">
                          {feature.trim()}
                        </span>
                      ))}
                      {unit.features.split(',').length > 3 && (
                        <span className="feature-more-Browse">
                          +{unit.features.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-container-Browse">
              <div className="no-results-icon-Browse">🔍</div>
              <h3 className="no-results-title-Browse">No units found</h3>
              <p className="no-results-Browse">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && !showApplyForm && (
        <div className="modal-overlay-Browse" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content-Browse" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section-Browse">
              <div className="modal-header-Browse">
                <h2 className="modal-title-Browse">{selectedUnit.name}</h2>
                <div className={`unit-status-Browse unit-status-${selectedUnit.status.toLowerCase()}-Browse modal-status-Browse`}>
                  {selectedUnit.status}
                </div>
              </div>
              <button className="close-btn-Browse" onClick={() => setSelectedUnit(null)}>
                <X size={24} />
              </button>
            </div>

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

            <div className="modal-details-Browse">
              <div className="detail-section-Browse">
                <div className="detail-item-Browse">
                  <DollarSign size={20} className="detail-icon-Browse" />
                  <div className="detail-content-Browse">
                    <span className="detail-label-Browse">Monthly Rent</span>
                    <span className="detail-price-Browse">₱{selectedUnit.price?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                <div className="detail-item-Browse">
                  <div className="detail-content-Browse">
                    <span className="detail-label-Browse">Description</span>
                    <p className="detail-description-Browse">{selectedUnit.description}</p>
                  </div>
                </div>

                {selectedUnit.features && (
                  <div className="detail-item-Browse">
                    <div className="detail-content-Browse">
                      <span className="detail-label-Browse">Features & Amenities</span>
                      <div className="features-list-Browse">
                        {selectedUnit.features.split(',').map((feature, index) => (
                          <span key={index} className="feature-tag-Browse feature-tag-large-Browse">
                            {feature.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="modal-header-section-Browse">
              <div className="form-header-Browse">
                <h2 className="form-title-Browse">Application for {selectedUnit.name}</h2>
                <p className="form-subtitle-Browse">Please fill out the application form below</p>
              </div>
              <button className="close-btn-Browse" onClick={() => setShowApplyForm(false)}>
                <X size={24} />
              </button>
            </div>

            <form className="application-form-Browse" onSubmit={handleFormSubmit}>
              <div className="form-section-Browse">
                <h3 className="form-section-title-Browse">
                  <User size={20} />
                  Personal Information
                </h3>

                <div className="form-row-Browse">
                  <div className="form-field-Browse">
                    <label className="form-label-Browse">Full Name</label>
                    <div className="input-with-icon-Browse">
                      <User size={18} className="input-icon-Browse" />
                      <input
                        type="text"
                        name="fullName"
                        className="form-input-Browse form-input-readonly-Browse"
                        value={tenantDetails.fullName || ""}
                        readOnly
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-Browse">
                    <label className="form-label-Browse">Email Address</label>
                    <div className="input-with-icon-Browse">
                      <Mail size={18} className="input-icon-Browse" />
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
                </div>

                <div className="form-field-Browse">
                  <label className="form-label-Browse">Phone Number</label>
                  <div className="input-with-icon-Browse">
                    <Phone size={18} className="input-icon-Browse" />
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
              </div>

              <div className="form-section-Browse">
                <h3 className="form-section-title-Browse">
                  <FileText size={20} />
                  Required Documents
                </h3>
                <p className="form-help-text-Browse">Please upload clear photos or scans of the following documents:</p>

                <div className="document-upload-grid-Browse">
                  <div className="document-upload-Browse">
                    <label className="document-label-Browse">
                      <Upload size={20} />
                      Valid ID (Government Issued)
                    </label>
                    <input
                      type="file"
                      name="validId"
                      className="document-file-input-Browse"
                      accept="image/*,.pdf"
                      required
                    />
                  </div>

                  <div className="document-upload-Browse">
                    <label className="document-label-Browse">
                      <Upload size={20} />
                      Barangay Clearance
                    </label>
                    <input
                      type="file"
                      name="brgyClearance"
                      className="document-file-input-Browse"
                      accept="image/*,.pdf"
                      required
                    />
                  </div>

                  <div className="document-upload-Browse">
                    <label className="document-label-Browse">
                      <Upload size={20} />
                      Proof of Income
                    </label>
                    <input
                      type="file"
                      name="proofOfIncome"
                      className="document-file-input-Browse"
                      accept="image/*,.pdf"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-buttons-container-Browse">
                <button type="button" className="form-cancel-btn-Browse" onClick={() => setShowApplyForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="form-submit-btn-Browse">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay-Browse success-modal-overlay-Browse">
          <div className="success-modal-Browse">
            <div className="success-modal-content-Browse">
              <div className="success-checkmark-Browse">
                <CheckCircle size={80} className="check-icon-Browse" />
              </div>

              <h2 className="success-title-Browse">Application Submitted!</h2>

              <p className="success-message-Browse">
                Your application has been submitted successfully. We will review your
                application and contact you within 2–3 business days.
              </p>

              <div className="success-details-Browse">
                <div className="success-detail-item-Browse">
                  <strong>Property:</strong>
                  <span className="detail-value-Browse">{selectedUnit?.name || "Unit Name"}</span>
                </div>
                <div className="success-detail-item-Browse">
                  <strong>Monthly Rent:</strong>
                  <span className="detail-value-Browse">₱{selectedUnit?.price?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <button
                className="success-close-btn-Browse"
                onClick={handleCloseSuccessModal}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseUnits;