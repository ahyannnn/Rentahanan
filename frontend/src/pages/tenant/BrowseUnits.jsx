import React, { useEffect, useState, useRef } from "react";
import "../../styles/tenant/BrowseUnits.css";

const BrowseUnits = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [application, setApplication] = useState({});
  const [hasApplied, setHasApplied] = useState(false); // ✅ Declare first
  const carouselRef = useRef(null);

  const tenantId = localStorage.getItem("userId");

  // ✅ Fetch all units
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

        // Fix here: use data.unitid instead of data.unit_id
        if (data.unitid === null || data.unitid === undefined) {
          setHasApplied(false);
        } else {
          setHasApplied(true);
        }

        setApplication(data);
      } else if (res.status === 404) {
        setHasApplied(false);
      } else {
        console.error("Unexpected response status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching tenant application:", err);
    }
  };

  fetchApplication();
}, [tenantId]);






  console.log("Has Applied:", hasApplied);
  console.log("tenantId:", tenantId);



  const scrollCarousel = (direction) => {
    const container = carouselRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth;
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleApply = () => setShowApplyForm(true);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validate selected unit
    if (!selectedUnit) {
      alert("Please select a unit to apply for.");
      return;
    }

    // Validate tenant hasn't already applied
    if (hasApplied) {
      alert("You have already applied for a unit.");
      return;
    }

    // Validate files
    const validIdFile = document.querySelector('input[name="validId"]').files[0];
    const brgyClearanceFile = document.querySelector('input[name="brgyClearance"]').files[0];
    const proofOfIncomeFile = document.querySelector('input[name="proofOfIncome"]').files[0];

    if (!validIdFile || !brgyClearanceFile || !proofOfIncomeFile) {
      alert("All required documents must be uploaded.");
      return;
    }

    // Optional: Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (![validIdFile, brgyClearanceFile, proofOfIncomeFile].every(f => allowedTypes.includes(f.type))) {
      alert("Files must be JPEG, PNG, or PDF.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("unit_id", selectedUnit.id);
    formData.append("validId", validIdFile);
    formData.append("brgyClearance", brgyClearanceFile);
    formData.append("proofOfIncome", proofOfIncomeFile);

    // Submit
    fetch("http://localhost:5000/api/apply", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
    alert(data.message || "Application submitted successfully!");
    setShowApplyForm(false);
    setSelectedUnit(null);

    // ✅ Refetch tenant application to update hasApplied properly
    fetch(`http://localhost:5000/api/application/${tenantId}`)
      .then((res) => res.json())
      .then((appData) => {
        if (appData.unit_id) {
          setHasApplied(true);
          setApplication(appData);
        } else {
          setHasApplied(false);
        }
      })
      .catch((err) => console.error("Error fetching updated application:", err));
})

  };


  return (
    <div className="browse-units-container">
      <h1 className="page-header">Browse Units</h1>

      {/* Carousel */}
      <div className="units-carousel-container">
        <button className="carousel-arrow left" onClick={() => scrollCarousel(-1)}>
          &lt;
        </button>

        <div className="units-carousel" ref={carouselRef}>
          {units.map((unit, index) => (
            <div key={unit.id} className="unit-card" onClick={() => setSelectedUnit(unit)}>
              <img
                src={`/images/house${index + 1}.jpg`}
                alt={unit.name}
                className="unit-image"
              />
              <div className="unit-info">
                <h3>{unit.name}</h3>
                <p className="unit-price">₱{unit.price.toLocaleString()} / month</p>
                <p className={`unit-status ${unit.status.toLowerCase()}`}>{unit.status}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={() => scrollCarousel(1)}>
          &gt;
        </button>
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && !showApplyForm && (
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/images/house${units.indexOf(selectedUnit) + 1}.jpg`}
              alt={selectedUnit.name}
              className="modal-image"
            />
            <h2>{selectedUnit.name}</h2>
            <p>{selectedUnit.description}</p>
            <p>
              <strong>₱{selectedUnit.price.toLocaleString()}</strong> / month
            </p>
            <p>Status: <strong>{selectedUnit.status}</strong></p>

            <button
              className="apply-btn"
              disabled={hasApplied || selectedUnit.status.toLowerCase() === "occupied"}
              onClick={handleApply}
            >
              {selectedUnit.status.toLowerCase() === "occupied"
                ? "Not Available"
                : hasApplied
                  ? "Already Applied"
                  : "Apply"}
            </button>
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {selectedUnit && showApplyForm && (
        <div className="modal-overlay" onClick={() => setShowApplyForm(false)}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for {selectedUnit.name}</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Full Name:
                <input
                  type="text"
                  name="fullName"
                  value={application.fullName || ""}
                  readOnly
                  required
                />
              </label>

              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={application.email || ""}
                  readOnly
                  required
                />
              </label>

              <label>
                Phone Number:
                <input
                  type="tel"
                  name="phone"
                  value={application.phone || ""}
                  readOnly
                  required
                />
              </label>

              <label>
                Valid ID:
                <input type="file" name="validId" accept="image/*,.pdf" required />
              </label>
              <label>
                Barangay Clearance:
                <input type="file" name="brgyClearance" accept="image/*,.pdf" required />
              </label>
              <label>
                Proof of Income:
                <input type="file" name="proofOfIncome" accept="image/*,.pdf" required />
              </label>

              <div className="form-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowApplyForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseUnits;
