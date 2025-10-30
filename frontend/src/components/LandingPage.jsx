import React, { useEffect, useState } from "react";
import "../styles/LandingPage.css";
import { Link } from "react-router-dom";

function LandingPage() {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);

  useEffect(() => {
    // Fetch houses from Flask API
    fetch("http://localhost:5000/api/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data))
      .catch((err) => console.error("Error fetching houses:", err));
  }, []);

  return (
    <div className="landing-container-Layout">
      {/* Navbar */}
      <nav className="navbar-Layout">
        <div className="nav-brand-container-Layout">
          <img
            src="/logo.png"
            alt="RenTahanan Logo"
            className="logo-Layout"
          />
          <div className="nav-brand-text-Layout">RenTahanan</div>
        </div>
        <div className="nav-links-Layout">
          <Link to="/login" className="nav-btn-Layout login-btn-Layout">Login</Link>
          <Link to="/register" className="nav-btn-Layout register-btn-Layout">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section-Layout">
        <div className="hero-overlay-Layout"></div>
        <div className="hero-content-Layout">
          <h1 className="hero-title-Layout">Discover Your New Home</h1>
          <p className="hero-subtitle-Layout">Helping renters find their perfect fit.</p>
        </div>
      </section>

      {/* Houses Section */}
      <section className="houses-section-Layout">
        <h2 className="section-title-Layout">Houses</h2>
        <div className="houses-container-Layout">
          {houses.map((house) => (
            <div
              key={house.id}
              className="house-card-Layout"
              onClick={() => setSelectedHouse(house)}
            >
              <img
                src={`http://localhost:5000/uploads/houseimages/${house.imagepath}`}
                alt={house.name}
                className="house-image-Layout"
                onError={(e) => {
                  e.target.src = "/images/default-house.jpg";
                }}
              />
              <div className="house-info-Layout">
                <h3 className="house-name-Layout">{house.name}</h3>
                <p className="house-price-Layout">₱{house.price.toLocaleString()}</p>
                <p className={`house-status-Layout status-${house.status.toLowerCase()}-Layout`}>
                  {house.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Popup Modal */}
        {selectedHouse && (
          <div className="modal-overlay-Layout" onClick={() => setSelectedHouse(null)}>
            <div className="modal-content-Layout" onClick={(e) => e.stopPropagation()}>
              <img
                src={`http://localhost:5000/uploads/houseimages/${selectedHouse.imagepath}`}
                alt={selectedHouse.name}
                className="modal-image-Layout"
                onError={(e) => {
                  e.target.src = "/images/default-house.jpg";
                }}
              />
              <h2 className="modal-title-Layout">{selectedHouse.name}</h2>
              <p className="modal-description-Layout">{selectedHouse.description}</p>
              <p className="modal-price-Layout"><strong>₱{selectedHouse.price.toLocaleString()}</strong> / month</p>
              <p className="modal-status-Layout">Status: <strong>{selectedHouse.status}</strong></p>
              <button
                className="close-btn-Layout"
                onClick={() => setSelectedHouse(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section-Layout">
        <h2 className="section-title-Layout">Why Choose RENTAHANAN?</h2>
        <div className="features-container-Layout">
          <div className="feature-card-Layout">
            <h3 className="feature-title-Layout">Easy Management</h3>
            <p className="feature-description-Layout">Track payments, tenants, and properties in one dashboard.</p>
          </div>
          <div className="feature-card-Layout">
            <h3 className="feature-title-Layout">Secure Payments</h3>
            <p className="feature-description-Layout">Integrated payment system ensures your money is safe.</p>
          </div>
          <div className="feature-card-Layout">
            <h3 className="feature-title-Layout">Accessible Anywhere</h3>
            <p className="feature-description-Layout">View your rental properties and tenants from any device.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section-Layout">
        <h2 className="section-title-Layout">About RENTAHANAN</h2>
        <p className="about-description-Layout">
          RENTAHANAN is made for us — the tenants looking for a place to call home.
          It helps us easily find available rooms or houses that fit our budget and needs.
          No more endless searching or unreliable listings — just verified, comfortable spaces
          where we can start new chapters with peace of mind.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer-Layout">
        <p className="footer-text-Layout">&copy; 2025 RENTAHANAN. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;