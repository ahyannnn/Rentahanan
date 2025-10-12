import React, { useEffect, useState } from "react";
import "../styles/LandingPage.css";
import { Link } from "react-router-dom";


function LandingPage() {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);

  useEffect(() => {
    // Fetch 5 houses from Flask API
    fetch("http://localhost:5000/api/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data))
      .catch((err) => console.error("Error fetching houses:", err));
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">🏡 Rentahanan</div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn login">Login</Link>
          <Link to="/register" className="nav-btn register">Register</Link>
        </div>
      </nav>



      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Discover Your New Home</h1>
          <p>Helping renters find their perfect fit.</p>
        </div>
      </section>

      {/* Houses Section */}
      <section className="houses-section">
        <h2>Available Houses</h2>
        <div className="houses-container">
          {houses.map((house, index) => (
            <div
              key={house.id}
              className="house-card"
              onClick={() => setSelectedHouse(house)}
            >
              <img
                src={`/images/house${index + 1}.jpg`}
                alt={house.name}
                className="house-image"
              />
              <div className="house-info">
                <h3>{house.name}</h3>
                <p className="price">₱{house.price.toLocaleString()}</p>
                <p className={`status ${house.status.toLowerCase()}`}>
                  {house.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Popup Modal */}
        {selectedHouse && (
          <div className="modal-overlay" onClick={() => setSelectedHouse(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={`/images/house${houses.indexOf(selectedHouse) + 1
                  }.jpg`}
                alt={selectedHouse.name}
                className="modal-image"
              />
              <h2>{selectedHouse.name}</h2>
              <p>{selectedHouse.description}</p>
              <p><strong>₱{selectedHouse.price.toLocaleString()}</strong> / month</p>
              <p>Status: <strong>{selectedHouse.status}</strong></p>
              <button
                className="close-btn"
                onClick={() => setSelectedHouse(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose RENTAHANAN?</h2>
        <div className="features-container">
          <div className="feature-card">
            <h3>Easy Management</h3>
            <p>Track payments, tenants, and properties in one dashboard.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Payments</h3>
            <p>Integrated payment system ensures your money is safe.</p>
          </div>
          <div className="feature-card">
            <h3>Accessible Anywhere</h3>
            <p>View your rental properties and tenants from any device.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>About RENTAHANAN</h2>
        <p>
          RENTAHANAN is made for us — the tenants looking for a place to call home.
          It helps us easily find available rooms or houses that fit our budget and needs.
          No more endless searching or unreliable listings — just verified, comfortable spaces
          where we can start new chapters with peace of mind.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 RENTAHANAN. All Rights Reserved.</p>
      </footer>
    </div >
  );
}

export default LandingPage;
