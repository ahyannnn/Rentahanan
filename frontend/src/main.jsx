import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Components
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Forgot from "./components/Forgot";

// Tenant Pages
import TenantDashboard from "./pages/tenant/Dashboard"; // Changed name for clarity
import BrowseUnits from "./pages/tenant/BrowseUnits";
import MyBills from "./pages/tenant/MyBills";
import Payment from "./pages/tenant/Payment";
import Contract from "./pages/tenant/Contract";
import TenantSupport from "./pages/tenant/Support"; // Changed name for clarity

// ✅ OWNER Pages (Import these)
import OwnerDashboard from "./pages/owner/Dashboard";
import Units from "./pages/owner/Units";
import Tenants from "./pages/owner/Tenants";
import Transactions from "./pages/owner/Transactions";
import Billing from "./pages/owner/Billing";
import Notification from "./pages/owner/Notification";
import User from "./pages/owner/User";
import OwnerContract from "./pages/owner/Contract";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* 🏠 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />

        {/* 👥 Tenant Routes with Layout */}
        <Route path="/tenant" element={<Layout />}>
          <Route index element={<TenantDashboard />} /> 
          <Route path="browse-units" element={<BrowseUnits />} /> 
          <Route path="bills" element={<MyBills />} /> 
          <Route path="payment" element={<Payment />} /> 
          <Route path="contract" element={<Contract />} /> 
          <Route path="support" element={<TenantSupport />} /> 
        </Route>
        
        {/* 🧑‍💼 OWNER Routes with Layout (✅ IDAGDAG MO ITO) */}
        <Route path="/owner" element={<Layout />}>
          <Route index element={<OwnerDashboard />} /> {/* /owner */}
          <Route path="units" element={<Units />} />           {/* /owner/units */}
          <Route path="tenants" element={<Tenants />} />       {/* /owner/tenants */}
          <Route path="transactions" element={<Transactions />} /> {/* /owner/transactions */}
          <Route path="billing" element={<Billing />} />       {/* /owner/billing */}
          <Route path="contract" element={<OwnerContract />} />     {/* /owner/contract */}
          <Route path="notifications" element={<Notification />} /> {/* /owner/notifications */}
          <Route path="user" element={<User />} />             {/* /owner/user */}
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);