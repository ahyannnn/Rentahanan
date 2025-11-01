import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, X, FileText, Download, Eye, Calendar, DollarSign, User, Mail, Phone, Home, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import "../../styles/owners/Billing.css";

function Billing() {
    const location = useLocation();

    // ✅ If coming from Tenants page, open Applicants tab
    const [activeTab, setActiveTab] = useState(
        location.state?.openApplicants ? "applicants" : "tenants"
    );

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showTenantInvoiceModal, setShowTenantInvoiceModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [successModalData, setSuccessModalData] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        type: "success" // success, error, confirm
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [issuedApplicantInvoices, setIssuedApplicantInvoices] = useState([]);
    const [tenantContracts, setTenantContracts] = useState([]);
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

    const [tenantFormData, setTenantFormData] = useState({
        tenantId: "",
        invoiceNo: "",
        billType: "Rent",
        amount: "",
        description: "",
        issuedDate: "",
        dueDate: "",
        unitName: ""
    });

    // ✅ Helper function
    const getTodayDate = () => new Date().toISOString().split("T")[0];

    // ✅ Show modal function
    const showModal = (title, message, type = "success") => {
        setModalConfig({ title, message, type });
        if (type === "success") {
            setShowSuccessModal(true);
        } else if (type === "error") {
            setShowErrorModal(true);
        } else if (type === "confirm") {
            setShowConfirmModal(true);
        }
    };

    // ✅ Close all modals
    const closeAllModals = () => {
        setShowSuccessModal(false);
        setShowErrorModal(false);
        setShowConfirmModal(false);
    };

    // Fetch tenants, applicants, tenant contracts, and issued applicant invoices
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenantsRes, applicantsRes, contractsRes, issuedInvoicesRes] = await Promise.all([
                    fetch("http://localhost:5000/api/billing/bills"),
                    fetch("http://localhost:5000/api/applicants/for-billing"),
                    fetch("http://localhost:5000/api/contracts/tenants"),
                    fetch("http://localhost:5000/api/billing/issued-applicant-invoices")
                ]);
                setTenants(await tenantsRes.json());
                setApplicants(await applicantsRes.json());
                setTenantContracts(await contractsRes.json());
                setIssuedApplicantInvoices(await issuedInvoicesRes.json());
            } catch (error) {
                console.error("Error fetching billing data:", error);
                showModal("Error", "Failed to load billing data. Please try again.", "error");
            }
        };
        fetchData();
    }, []);

    // ✅ Filter applicants to only show those without issued invoices
    const filteredApplicants = applicants.filter(applicant => {
        const hasIssuedInvoice = issuedApplicantInvoices.some(invoice => 
            invoice.tenantId === applicant.applicationid
        );
        return !hasIssuedInvoice;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTenantInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "tenantId") {
            const selectedContract = tenantContracts.find(contract => contract.tenantid === parseInt(value));
            if (selectedContract) {
                setTenantFormData(prev => ({
                    ...prev,
                    tenantId: value,
                    unitName: selectedContract.unit_name,
                    amount: prev.billType === "Rent" ? selectedContract.unit_price : prev.amount
                }));
            }
        } else if (name === "billType") {
            const selectedContract = tenantContracts.find(contract => contract.tenantid === parseInt(tenantFormData.tenantId));
            if (value === "Rent" && selectedContract) {
                setTenantFormData(prev => ({
                    ...prev,
                    billType: value,
                    amount: selectedContract.unit_price
                }));
            } else {
                setTenantFormData(prev => ({
                    ...prev,
                    billType: value,
                    amount: ""
                }));
            }
        } else {
            setTenantFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const openTenantInvoiceModal = () => {
        const today = getTodayDate();
        setTenantFormData({
            tenantId: "",
            invoiceNo: `INV-${Date.now()}`,
            billType: "Rent",
            amount: "",
            description: "",
            issuedDate: today,
            dueDate: "",
            unitName: ""
        });
        setShowTenantInvoiceModal(true);
    };

    
    const handleSaveInvoice = async () => {
        if (!formData.tenantId || !formData.amount) {
            showModal("Missing Information", "Please fill in all required fields.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/billing/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccessModalData({
                    tenantName: selectedApplicant?.fullname,
                    amount: formData.amount,
                    issuedDate: formData.issuedDate,
                    dueDate: formData.dueDate
                });
                
                setShowAddModal(false);
                setShowSuccessModal(true);
                setFormData({
                    tenantId: "",
                    invoiceNo: "",
                    billType: "Security Deposit & Advance Payment",
                    amount: "",
                    description: "",
                    issuedDate: "",
                    dueDate: "",
                });

                const [tenantsRes, applicantsRes, issuedInvoicesRes] = await Promise.all([
                    fetch("http://localhost:5000/api/billing/bills"),
                    fetch("http://localhost:5000/api/applicants/for-billing"),
                    fetch("http://localhost:5000/api/billing/issued-applicant-invoices")
                ]);
                setTenants(await tenantsRes.json());
                setApplicants(await applicantsRes.json());
                setIssuedApplicantInvoices(await issuedInvoicesRes.json());
            } else {
                showModal("Error", "Failed to create invoice. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            showModal("Error", "An error occurred while creating the invoice.", "error");
        }
    };

    const handleSaveTenantInvoice = async () => {
        if (!tenantFormData.tenantId || !tenantFormData.amount || !tenantFormData.billType) {
            showModal("Missing Information", "Please fill in all required fields.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/billing/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tenantFormData),
            });

            if (response.ok) {
                const selectedContract = tenantContracts.find(contract => contract.tenantid === parseInt(tenantFormData.tenantId));
                setSuccessModalData({
                    tenantName: selectedContract?.fullname,
                    amount: tenantFormData.amount,
                    issuedDate: tenantFormData.issuedDate,
                    dueDate: tenantFormData.dueDate
                });
                
                setShowTenantInvoiceModal(false);
                setShowSuccessModal(true);
                setTenantFormData({
                    tenantId: "",
                    invoiceNo: "",
                    billType: "Rent",
                    amount: "",
                    description: "",
                    issuedDate: "",
                    dueDate: "",
                    unitName: ""
                });

                const tenantsRes = await fetch("http://localhost:5000/api/billing/bills");
                setTenants(await tenantsRes.json());
            } else {
                showModal("Error", "Failed to create invoice. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            showModal("Error", "An error occurred while creating the invoice.", "error");
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setSuccessModalData(null);
    };

    const handleMarkAsPaid = async (invoiceId) => {
        setSelectedInvoice(invoiceId);
        showModal("Confirm Payment", "Are you sure you want to mark this invoice as paid?", "confirm");
    };

    const confirmMarkAsPaid = async () => {
        if (!selectedInvoice) return;

        try {
            const response = await fetch(`http://localhost:5000/api/billing/mark-paid/${selectedInvoice}`, {
                method: "PUT",
            });

            if (response.ok) {
                showModal("Success", "Invoice marked as paid successfully!", "success");
                const tenantsRes = await fetch("http://localhost:5000/api/billing/bills");
                setTenants(await tenantsRes.json());
            } else {
                showModal("Error", "Failed to mark invoice as paid.", "error");
            }
        } catch (error) {
            console.error("Error marking invoice as paid:", error);
            showModal("Error", "An error occurred while marking the invoice as paid.", "error");
        } finally {
            setSelectedInvoice(null);
            closeAllModals();
        }
    };

    const openViewModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowViewModal(true);
    };

    const filteredTenants = tenants.filter(tenant =>
        tenant.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.invoiceno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.unit_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate statistics
    const stats = {
        total: tenants.length,
        paid: tenants.filter(t => t.status === 'Paid' || t.status === 'PAID').length,
        unpaid: tenants.filter(t => t.status === 'Unpaid').length,
        totalRevenue: tenants.filter(t => t.status === 'Paid' || t.status === 'PAID').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
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
                        <span className="Owner-Billing-tab-badge">{filteredApplicants.length}</span>
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
                        <button
                            className="Owner-Billing-add-btn"
                            onClick={openTenantInvoiceModal}
                        >
                            <Plus size={16} />
                            New Invoice
                        </button>
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
                                                {tenant.invoiceno || `INV-${tenant.billid}`}
                                            </td>
                                            <td>
                                                <div className="Owner-Billing-tenant-info">
                                                    <span className="Owner-Billing-tenant-name">{tenant.tenant_name}</span>
                                                    <span className="Owner-Billing-tenant-email">{tenant.email}</span>
                                                </div>
                                            </td>
                                            <td>{tenant.unit_name}</td>
                                            <td className="Owner-Billing-amount">
                                                ₱{parseFloat(tenant.amount || 0).toLocaleString()}
                                            </td>
                                            <td>{new Date(tenant.issuedate).toLocaleDateString()}</td>
                                            <td>{tenant.duedate ? new Date(tenant.duedate).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <span className={`Owner-Billing-status-badge ${tenant.status?.toLowerCase()}`}>
                                                    {tenant.status}
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
                                                    {tenant.status === 'Unpaid' && (
                                                        <button
                                                            className="Owner-Billing-mark-paid-btn"
                                                            onClick={() => handleMarkAsPaid(tenant.billid)}
                                                        >
                                                            <CheckCircle size={14} />
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
                                {filteredApplicants.length > 0 ? (
                                    filteredApplicants.map((app, i) => (
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

            {/* Add Invoice Modal for Applicants */}
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
                                        required
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

            {/* Add Invoice Modal for Tenants */}
            {showTenantInvoiceModal && (
                <div className="Owner-Billing-modal-overlay">
                    <div className="Owner-Billing-modal Owner-Billing-add-modal">
                        <div className="Owner-Billing-modal-header">
                            <h3>Create New Invoice</h3>
                            <button className="Owner-Billing-close-btn" onClick={() => setShowTenantInvoiceModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="Owner-Billing-modal-body">
                            <div className="Owner-Billing-form-grid">
                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Tenant Name *</label>
                                    <select
                                        name="tenantId"
                                        value={tenantFormData.tenantId}
                                        onChange={handleTenantInputChange}
                                        className="Owner-Billing-form-select"
                                        required
                                    >
                                        <option value="">Select a tenant</option>
                                        {tenantContracts.map((contract) => (
                                            <option key={contract.tenantid} value={contract.tenantid}>
                                                {contract.fullname} - {contract.unit_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Unit Name</label>
                                    <input
                                        type="text"
                                        name="unitName"
                                        value={tenantFormData.unitName}
                                        className="Owner-Billing-form-input"
                                        readOnly
                                        placeholder="Will auto-fill when tenant is selected"
                                    />
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Bill Type *</label>
                                    <select
                                        name="billType"
                                        value={tenantFormData.billType}
                                        onChange={handleTenantInputChange}
                                        className="Owner-Billing-form-select"
                                    >
                                        <option value="Rent">Rent</option>
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Amount (₱) *</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={tenantFormData.amount}
                                        onChange={handleTenantInputChange}
                                        className="Owner-Billing-form-input"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Issued Date *</label>
                                    <input
                                        type="date"
                                        name="issuedDate"
                                        value={tenantFormData.issuedDate}
                                        onChange={handleTenantInputChange}
                                        className="Owner-Billing-form-input"
                                        required
                                    />
                                </div>

                                <div className="Owner-Billing-form-group">
                                    <label className="Owner-Billing-form-label">Due Date *</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={tenantFormData.dueDate}
                                        onChange={handleTenantInputChange}
                                        className="Owner-Billing-form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="Owner-Billing-form-group">
                                <label className="Owner-Billing-form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={tenantFormData.description}
                                    onChange={handleTenantInputChange}
                                    className="Owner-Billing-form-textarea"
                                    placeholder="Enter invoice description..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="Owner-Billing-modal-footer">
                            <button className="Owner-Billing-cancel-btn" onClick={() => setShowTenantInvoiceModal(false)}>
                                Cancel
                            </button>
                            <button className="Owner-Billing-save-btn" onClick={handleSaveTenantInvoice}>
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
                                    <span className="Owner-Billing-invoice-number">{selectedInvoice.invoiceno || `INV-${selectedInvoice.billid}`}</span>
                                    <span className={`Owner-Billing-status-badge ${selectedInvoice.status?.toLowerCase()}`}>
                                        {selectedInvoice.status}
                                    </span>
                                </div>
                                <div className="Owner-Billing-invoice-amount">
                                    ₱{parseFloat(selectedInvoice.amount || 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="Owner-Billing-invoice-details">
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Tenant Name</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.tenant_name}</span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Unit</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.unit_name}</span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Bill Type</span>
                                    <span className="Owner-Billing-detail-value">{selectedInvoice.billtype}</span>
                                </div>
                                <div className="Owner-Billing-detail-row">
                                    <span className="Owner-Billing-detail-label">Issued Date</span>
                                    <span className="Owner-Billing-detail-value">
                                        {new Date(selectedInvoice.issuedate).toLocaleDateString()}
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
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ SUCCESS MODAL */}
            {showSuccessModal && successModalData && (
                <div className="Owner-Billing-success-modal-overlay">
                    <div className="Owner-Billing-success-modal">
                        <div className="Owner-Billing-success-modal-content">
                            <div className="Owner-Billing-success-animation-container">
                                <div className="Owner-Billing-success-checkmark">
                                    <CheckCircle size={80} className="Owner-Billing-check-icon" />
                                </div>
                                <div className="Owner-Billing-success-confetti">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="Owner-Billing-confetti-piece"></div>
                                    ))}
                                </div>
                            </div>
                            
                            <h2 className="Owner-Billing-success-title">Invoice Created Successfully!</h2>
                            
                            <p className="Owner-Billing-success-message">
                                The invoice has been created and sent to the tenant. You can track its status in the invoices tab.
                            </p>

                            <div className="Owner-Billing-success-details">
                                <div className="Owner-Billing-success-detail-item">
                                    <span className="Owner-Billing-detail-label">Tenant Name:</span>
                                    <span className="Owner-Billing-detail-value">
                                        {successModalData.tenantName || 'N/A'}
                                    </span>
                                </div>
                                <div className="Owner-Billing-success-detail-item">
                                    <span className="Owner-Billing-detail-label">Amount:</span>
                                    <span className="Owner-Billing-detail-value">
                                        ₱{parseFloat(successModalData.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="Owner-Billing-success-detail-item">
                                    <span className="Owner-Billing-detail-label">Issued Date:</span>
                                    <span className="Owner-Billing-detail-value">
                                        {successModalData.issuedDate ? new Date(successModalData.issuedDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="Owner-Billing-success-detail-item">
                                    <span className="Owner-Billing-detail-label">Due Date:</span>
                                    <span className="Owner-Billing-detail-value">
                                        {successModalData.dueDate ? new Date(successModalData.dueDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <button 
                                className="Owner-Billing-success-close-btn"
                                onClick={handleCloseSuccessModal}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ ERROR MODAL */}
            {showErrorModal && (
                <div className="modal-overlay-transactions">
                    <div className="modal-content-transactions">
                        <button className="close-btn-transactions" onClick={closeAllModals}>
                            <X size={20} />
                        </button>
                        <div className="modal-icon-transactions">
                            <AlertCircle size={60} className="modal-icon-danger" />
                        </div>
                        <h3 className="modal-title-transactions">{modalConfig.title}</h3>
                        <p className="modal-message-transactions">{modalConfig.message}</p>
                        <div className="modal-actions-transactions">
                            <button className="modal-btn-transactions modal-btn-cancel" onClick={closeAllModals}>
                                Close
                            </button>
                            <button className="modal-btn-transactions modal-btn-confirm" onClick={closeAllModals}>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ CONFIRM MODAL */}
            {showConfirmModal && (
                <div className="modal-overlay-transactions">
                    <div className="modal-content-transactions">
                        <button className="close-btn-transactions" onClick={closeAllModals}>
                            <X size={20} />
                        </button>
                        <div className="modal-icon-transactions">
                            <AlertTriangle size={60} className="modal-icon-warning" />
                        </div>
                        <h3 className="modal-title-transactions">{modalConfig.title}</h3>
                        <p className="modal-message-transactions">{modalConfig.message}</p>
                        <div className="modal-actions-transactions">
                            <button className="modal-btn-transactions modal-btn-cancel" onClick={closeAllModals}>
                                Cancel
                            </button>
                            <button className="modal-btn-transactions modal-btn-confirm" onClick={confirmMarkAsPaid}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;