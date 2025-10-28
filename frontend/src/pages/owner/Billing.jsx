import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, X, FileText, Download, Eye, Calendar, DollarSign, User, Mail, Phone, Home } from "lucide-react";
import "../../styles/owners/Billing.css";

function Billing() {
    const location = useLocation();

    // ✅ If coming from Tenants page, open Applicants tab
    const [activeTab, setActiveTab] = useState(
        location.state?.openApplicants ? "applicants" : "tenants"
    );

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        tenantId: "",
        invoiceNo: "",
        billType: "Security Deposit & Advance Payment",
        amount: "",
        description: "",
        issuedDate: "",
        dueDate: ""
    });

    // ✅ Helper function
    const getTodayDate = () => new Date().toISOString().split("T")[0];

    // Fetch tenants and applicants
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenantsRes, applicantsRes] = await Promise.all([
                    fetch("http://localhost:5000/api/billing/bills"),
                    fetch("http://localhost:5000/api/applicants/for-billing"),
                ]);
                setTenants(await tenantsRes.json());
                setApplicants(await applicantsRes.json());
            } catch (error) {
                console.error("Error fetching billing data:", error);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openInvoiceModal = (applicant) => {
        setSelectedApplicant(applicant);
        const today = getTodayDate();
        setFormData({
            tenantId: applicant.applicationid,
            invoiceNo: `INV-${Date.now()}`,
            billType: "Security Deposit & Advance Payment",
            amount: applicant.unit_price * 3 || "",
            description: `Initial payment for ${applicant.fullname} (${applicant.unit_name})`,
            issuedDate: today,
            dueDate: "",
        });
        setShowAddModal(true);
    };

    const handleSaveInvoice = async () => {
        if (!formData.tenantId || !formData.amount) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/billing/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Initial payment invoice issued successfully!");
                setShowAddModal(false);
                setFormData({
                    tenantId: "",
                    invoiceNo: "",
                    billType: "Security Deposit & Advance Payment",
                    amount: "",
                    description: "",
                    issuedDate: "",
                    dueDate: "",
                });
                
                // Refresh data
                const [tenantsRes, applicantsRes] = await Promise.all([
                    fetch("http://localhost:5000/api/billing/bills"),
                    fetch("http://localhost:5000/api/applicants/for-billing"),
                ]);
                setTenants(await tenantsRes.json());
                setApplicants(await applicantsRes.json());
            } else {
                alert("Failed to create invoice.");
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            alert("An error occurred while creating the invoice.");
        }
    };

    const handleMarkAsPaid = async (invoiceId) => {
        if (window.confirm("Are you sure you want to mark this invoice as paid?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/billing/mark-paid/${invoiceId}`, {
                    method: "PUT",
                });

                if (response.ok) {
                    alert("Invoice marked as paid successfully!");
                    // Refresh tenants data
                    const tenantsRes = await fetch("http://localhost:5000/api/billing/bills");
                    setTenants(await tenantsRes.json());
                } else {
                    alert("Failed to mark invoice as paid.");
                }
            } catch (error) {
                console.error("Error marking invoice as paid:", error);
                alert("An error occurred while marking the invoice as paid.");
            }
        }
    };

    const openViewModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowViewModal(true);
    };

    const filteredTenants = tenants.filter(tenant =>
        tenant.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.invoiceno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.unit_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate statistics
    const stats = {
        total: tenants.length,
        paid: tenants.filter(t => t.bill_status === 'Paid').length,
        unpaid: tenants.filter(t => t.bill_status === 'Unpaid').length,
        totalRevenue: tenants.filter(t => t.bill_status === 'Paid').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
    };

    return (
        <div className="Owner-Billing-container">
            {/* Header */}
            <div className="Owner-Billing-header">
                <div className="Owner-Billing-header-content">
                    <h1 className="Owner-Billing-title">Billing & Invoicing</h1>
                    <p className="Owner-Billing-subtitle">Manage tenant invoices and applicant initial payments</p>
                </div>
                
                {/* Statistics Cards */}
                <div className="Owner-Billing-stats">
                    <div className="Owner-Billing-stat-card">
                        <div className="Owner-Billing-stat-icon total">
                            <FileText size={20} />
                        </div>
                        <div className="Owner-Billing-stat-info">
                            <span className="Owner-Billing-stat-number">{stats.total}</span>
                            <span className="Owner-Billing-stat-label">Total Invoices</span>
                        </div>
                    </div>
                    <div className="Owner-Billing-stat-card">
                        <div className="Owner-Billing-stat-icon paid">
                            <DollarSign size={20} />
                        </div>
                        <div className="Owner-Billing-stat-info">
                            <span className="Owner-Billing-stat-number">{stats.paid}</span>
                            <span className="Owner-Billing-stat-label">Paid</span>
                        </div>
                    </div>
                    <div className="Owner-Billing-stat-card">
                        <div className="Owner-Billing-stat-icon unpaid">
                            <Calendar size={20} />
                        </div>
                        <div className="Owner-Billing-stat-info">
                            <span className="Owner-Billing-stat-number">{stats.unpaid}</span>
                            <span className="Owner-Billing-stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="Owner-Billing-stat-card">
                        <div className="Owner-Billing-stat-icon revenue">
                            <DollarSign size={20} />
                        </div>
                        <div className="Owner-Billing-stat-info">
                            <span className="Owner-Billing-stat-number">₱{stats.totalRevenue.toLocaleString()}</span>
                            <span className="Owner-Billing-stat-label">Total Revenue</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="Owner-Billing-control-bar">
                <div className="Owner-Billing-tab-group">
                    <button
                        className={`Owner-Billing-tab-btn ${activeTab === "tenants" ? "Owner-Billing-tab-active" : ""}`}
                        onClick={() => setActiveTab("tenants")}
                    >
                        <FileText size={16} />
                        Tenant Invoices
                        <span className="Owner-Billing-tab-badge">{stats.total}</span>
                    </button>
                    <button
                        className={`Owner-Billing-tab-btn ${activeTab === "applicants" ? "Owner-Billing-tab-active" : ""}`}
                        onClick={() => setActiveTab("applicants")}
                    >
                        <User size={16} />
                        Applicant Payments
                        <span className="Owner-Billing-tab-badge">{applicants.length}</span>
                    </button>
                </div>

                {activeTab === "tenants" && (
                    <div className="Owner-Billing-search-box">
                        <Search size={18} className="Owner-Billing-search-icon" />
                        <input
                            type="text"
                            placeholder="Search invoices, tenants, or units..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="Owner-Billing-search-input"
                        />
                    </div>
                )}
            </div>

            {/* Tenant Invoices */}
            {activeTab === "tenants" && (
                <div className="Owner-Billing-content-card">
                    <div className="Owner-Billing-table-header">
                        <h3>Invoice Management</h3>
                        <p>Manage and track all tenant invoices</p>
                    </div>
                    
                    <div className="Owner-Billing-table-wrapper">
                        <table className="Owner-Billing-table">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Tenant</th>
                                    <th>Unit</th>
                                    <th>Amount</th>
                                    <th>Issued Date</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTenants.length > 0 ? (
                                    filteredTenants.map((tenant, i) => (
                                        <tr key={i} className="Owner-Billing-table-row">
                                            <td className="Owner-Billing-invoice-no">
                                                <FileText size={14} />
                                                {tenant.invoiceno}
                                            </td>
                                            <td>
                                                <div className="Owner-Billing-tenant-info">
                                                    <span className="Owner-Billing-tenant-name">{tenant.fullname}</span>
                                                    <span className="Owner-Billing-tenant-email">{tenant.email}</span>
                                                </div>
                                            </td>
                                            <td>{tenant.unit_name}</td>
                                            <td className="Owner-Billing-amount">
                                                ₱{parseFloat(tenant.amount || 0).toLocaleString()}
                                            </td>
                                            <td>{new Date(tenant.issueddate).toLocaleDateString()}</td>
                                            <td>{tenant.duedate ? new Date(tenant.duedate).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <span className={`Owner-Billing-status-badge ${tenant.bill_status?.toLowerCase()}`}>
                                                    {tenant.bill_status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="Owner-Billing-action-buttons">
                                                    <button 
                                                        className="Owner-Billing-view-btn"
                                                        onClick={() => openViewModal(tenant)}
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                    {tenant.bill_status === 'Unpaid' && (
                                                        <button 
                                                            className="Owner-Billing-mark-paid-btn"
                                                            onClick={() => handleMarkAsPaid(tenant.billid)}
                                                        >
                                                            <DollarSign size={14} />
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="Owner-Billing-empty-state">
                                            <FileText size={48} />
                                            <p>No invoices found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Applicant Initial Payments */}
            {activeTab === "applicants" && (
                <div className="Owner-Billing-content-card">
                    <div className="Owner-Billing-table-header">
                        <h3>Applicant Initial Payments</h3>
                        <p>Issue security deposit and advance payment invoices for new applicants</p>
                    </div>
                    
                    <div className="Owner-Billing-table-wrapper">
                        <table className="Owner-Billing-table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Contact Info</th>
                                    <th>Unit</th>
                                    <th>Monthly Rent</th>
                                    <th>Initial Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicants.length > 0 ? (
                                    applicants.map((app, i) => (
                                        <tr key={i} className="Owner-Billing-table-row">
                                            <td>
                                                <div className="Owner-Billing-applicant-info">
                                                    <span className="Owner-Billing-applicant-name">{app.fullname}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="Owner-Billing-contact-info">
                                                    <span className="Owner-Billing-contact-email">
                                                        <Mail size={12} />
                                                        {app.email}
                                                    </span>
                                                    <span className="Owner-Billing-contact-phone">
                                                        <Phone size={12} />
                                                        {app.phone}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="Owner-Billing-unit-info">
                                                    <Home size={12} />
                                                    {app.unit_name}
                                                </div>
                                            </td>
                                            <td className="Owner-Billing-amount">
                                                ₱{parseFloat(app.unit_price || 0).toLocaleString()}
                                            </td>
                                            <td className="Owner-Billing-initial-payment">
                                                ₱{parseFloat(app.unit_price * 3 || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <button
                                                    className="Owner-Billing-issue-btn"
                                                    onClick={() => openInvoiceModal(app)}
                                                >
                                                    <Plus size={14} />
                                                    Issue Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="Owner-Billing-empty-state">
                                            <User size={48} />
                                            <p>No applicants requiring initial payment</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Invoice Modal */}
            {showAddModal && (
                <div className="Owner-Billing-modal-overlay">
                    <div className="Owner-Billing-modal Owner-Billing-add-modal">
                        <div className="Owner-Billing-modal-header">
                            <h3>Issue Initial Payment Invoice</h3>
                            <button className="Owner-Billing-close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="Owner-Billing-modal-body">
                            <div className="Owner-Billing-applicant-summary">
                                <div className="Owner-Billing-applicant-avatar">
                                    <User size={24} />
                                </div>
                                <div className="Owner-Billing-applicant-details">
                                    <h4>{selectedApplicant?.fullname}</h4>
                                    <p>{selectedApplicant?.unit_name}</p>
                                </div>
                            </div>

                            <div className="Owner-Billing-form-grid">
                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Bill Type *</label>
                                    <select
                                        name="billType"
                                        value={formData.billType}
                                        onChange={handleInputChange}
                                        className="Owner-Billing-form-select"
                                    >
                                        <option>Security Deposit & Advance Payment</option>
                                        <option>Advance Rent Only</option>
                                        <option>Security Deposit Only</option>
                                    </select>
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Amount (₱) *</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="Owner-Billing-form-input"
                                        placeholder="Enter amount"
                                    />
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Issued Date *</label>
                                    <input
                                        type="date"
                                        name="issuedDate"
                                        value={formData.issuedDate}
                                        onChange={handleInputChange}
                                        className="Owner-Billing-form-input"
                                    />
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
                                        className="Owner-Billing-form-input"
                                    />
                                </div>
                            </div>

                            <div className="Owner-Billing-form-group">
                                <label className="Owner-Billing-form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="Owner-Billing-form-textarea"
                                    placeholder="Enter invoice description..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="Owner-Billing-modal-footer">
                            <button className="Owner-Billing-cancel-btn" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="Owner-Billing-save-btn" onClick={handleSaveInvoice}>
                                <FileText size={16} />
                                Create Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Invoice Modal */}
            {showViewModal && selectedInvoice && (
                <div className="Owner-Billing-modal-overlay">
                    <div className="Owner-Billing-modal Owner-Billing-view-modal">
                        <div className="Owner-Billing-modal-header">
                            <h3>Invoice Details</h3>
                            <button className="Owner-Billing-close-btn" onClick={() => setShowViewModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="Owner-Billing-modal-body">
                            <div className="Owner-Billing-invoice-header">
                                <div className="Owner-Billing-invoice-meta">
                                    <span className="Owner-Billing-invoice-number">{selectedInvoice.invoiceno}</span>
                                    <span className={`Owner-Billing-status-badge ${selectedInvoice.bill_status?.toLowerCase()}`}>
                                        {selectedInvoice.bill_status}
                                    </span>
                                </div>
                                <div className="Owner-Billing-invoice-amount">
                                    ₱{parseFloat(selectedInvoice.amount || 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="Owner-Billing-invoice-details">
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Tenant Name</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.fullname}</span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Unit</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.unit_name}</span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Bill Type</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.bill_type}</span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Issued Date</span>
                                    <span className="Owner-Billing-detail-value">
                                        {new Date(selectedInvoice.issueddate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Due Date</span>
                                    <span className="Owner-Billing-detail-value">
                                        {selectedInvoice.duedate ? new Date(selectedInvoice.duedate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Description</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.description}</span>
                                </div>
                            </div>
                        </div>

                        <div className="Owner-Billing-modal-footer">
                            <button className="Owner-Billing-close-detail-btn" onClick={() => setShowViewModal(false)}>
                                Close
                            </button>
                            {selectedInvoice.bill_status === 'Unpaid' && (
                                <button 
                                    className="Owner-Billing-mark-paid-btn"
                                    onClick={() => handleMarkAsPaid(selectedInvoice.billid)}
                                >
                                    <DollarSign size={16} />
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;