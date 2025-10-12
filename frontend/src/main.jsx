import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import "./index.css";
=======
import "./index.css";

// Components
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";

// Tenant Pages
import Dashboard from "./pages/tenant/Dashboard";
import BrowseUnits from "./pages/tenant/BrowseUnits";
import MyBills from "./pages/tenant/MyBills";
import Payment from "./pages/tenant/Payment";
import Contract from "./pages/tenant/Contract";
import Support from "./pages/tenant/Support";
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
=======

        {/* 🏠 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👥 Tenant Routes with Layout */}
        <Route path="/tenant" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* /tenant */}
          <Route path="browse-units" element={<BrowseUnits />} /> {/* /tenant/browse-units */}
          <Route path="bills" element={<MyBills />} /> {/* /tenant/bills */}
          <Route path="payment" element={<Payment />} /> {/* /tenant/payment */}
          <Route path="contract" element={<Contract />} /> {/* /tenant/contract */}
          <Route path="support" element={<Support />} /> {/* /tenant/support */}
        </Route>

>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
