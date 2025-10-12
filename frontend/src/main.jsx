import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

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

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
