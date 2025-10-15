import React, { useEffect, useState, useRef, use } from "react";
import "../../styles/tenant/BrowseUnits.css";

const BrowseUnits = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [application, setApplication] = useState({});
  const carouselRef = useRef(null);

  // ✅ Get the logged-in user’s ID from localStorage
  const tenantId = localStorage.getItem("userId");

  // ✅ Fetch all available units
  useEffect(() => {
    fetch("http://localhost:5000/api/houses")
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch((err) => console.error("Error fetching units:", err));
  }, []);

  // ✅ Fetch tenant’s existing application for autofill
  useEffect(() => {
    if (showApplyForm && tenantId) {
      fetch(`http://localhost:5000/api/application/${tenantId}`)
        .then((res) => res.json())
        .then((data) => setApplication(data))
        .catch((err) => console.error("Error fetching application:", err));
    }
  }, [showApplyForm, tenantId]);

  console.log(tenantId);
  // ✅ Scroll through carousel
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

  // ✅ Submit the application update (unit_id + valid ID)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("tenant_id", tenantId);
    formData.append("unit_id", selectedUnit.id);

    fetch("http://localhost:5000/api/apply", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Application submitted successfully!");
        setShowApplyForm(false);
        setSelectedUnit(null);
      })
      .catch((err) => console.error("Error submitting application:", err));
  };

  return (
    <div className="browse-units-container">
      <h1 className="page-header">Browse Units</h1>

      {/* ✅ Carousel */}
      <div className="units-carousel-container">
        <button className="carousel-arrow left" onClick={() => scrollCarousel(-1)}>
          &lt;
        </button>

        <div className="units-carousel" ref={carouselRef}>
          {units.map((unit, index) => (
            <div
              key={unit.id}
              className="unit-card"
              onClick={() => setSelectedUnit(unit)}
            >
              <img
                src={`/images/house${index + 1}.jpg`}
                alt={unit.name}
                className="unit-image"
              />
              <div className="unit-info">
                <h3>{unit.name}</h3>
                <p className="unit-price">₱{unit.price.toLocaleString()} / month</p>
                <p className={`unit-status ${unit.status.toLowerCase()}`}>
                  {unit.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={() => scrollCarousel(1)}>
          &gt;
        </button>
      </div>

      {/* ✅ Unit Detail Modal */}
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
              disabled={selectedUnit.status.toLowerCase() === "occupied"}
              onClick={handleApply}
            >
              {selectedUnit.status.toLowerCase() === "occupied"
                ? "Not Available"
                : "Apply"}
            </button>
          </div>
        </div>
      )}

      {/* ✅ Apply Form Modal */}
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
