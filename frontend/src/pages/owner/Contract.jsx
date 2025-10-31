import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useLocation } from "react-router-dom";
import { FileText, X, Download, User, Mail, Phone, Home, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react";
import "../../styles/owners/Contract.css";

const OwnerContract = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("tenants");
    const [contracts, setContracts] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successModalData, setSuccessModalData] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [highlightedApplicantId, setHighlightedApplicantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        tenantid: "",
        startdate: "",
        monthlyrent: "",
        deposit: "",
        advancepayment: "",
        remarks: "",
    });

    const sigPadRef = useRef(null);

    useEffect(() => {
        if (location.state?.openTab === "issue") {
            setActiveTab("issue");
            if (location.state?.selectedApplicantId) {
                setHighlightedApplicantId(location.state.selectedApplicantId);
            }
        }
    }, [location.state]);

    // Function to fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [contractsRes, applicantsRes] = await Promise.all([
                fetch("http://localhost:5000/api/contracts/tenants"),
                fetch("http://localhost:5000/api/contracts/applicants"),
            ]);
            const contractsData = await contractsRes.json();
            const applicantsData = await applicantsRes.json();
            setContracts(contractsData);
            setApplicants(applicantsData);

            if (location.state?.selectedApplicantId) {
                const foundApplicant = applicantsData.find(
                    (a) => a.applicationid === location.state.selectedApplicantId
                );
                if (foundApplicant) openIssueModal(foundApplicant);
            }
        } catch (error) {
            console.error("Error loading contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Function to get profile image URL
    const getProfileImage = (user) => {
        if (user.image) {
            return `http://localhost:5000/uploads/profile_images/${user.image}`;
        }
        if (user.profile_image) {
            return `http://localhost:5000/uploads/profile_images/${user.profile_image}`;
        }
        return null;
    };

    // Function to handle image error
    const handleImageError = (e, user) => {
        console.log("Image failed to load for user:", user.fullname);
        e.target.style.display = 'none';
        const fallbackElement = e.target.nextSibling;
        if (fallbackElement) {
            fallbackElement.style.display = 'flex';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openIssueModal = (applicant) => {
        setSelectedApplicant(applicant);
        const today = new Date().toISOString().split("T")[0];
        setFormData({
            tenantid: applicant.tenantid,
            unitid: applicant.unitid,
            startdate: today,
            monthlyrent: applicant.unit_price,
            deposit: applicant.unit_price,
            advancepayment: applicant.unit_price,
            remarks: `Contract for ${applicant.fullname} (${applicant.unit_name})`,
        });
        setShowAddModal(true);
    };

    const clearSignature = () => {
        sigPadRef.current.clear();
    };

    const handleGeneratePDF = async () => {
        try {
            const signatureData = sigPadRef.current.isEmpty()
                ? null
                : sigPadRef.current.getCanvas().toDataURL("image/png");

            const pdfResponse = await fetch("http://localhost:5000/api/contracts/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantid: formData.tenantid,
                    tenant_name: selectedApplicant.fullname,
                    unit_name: selectedApplicant.unit_name,
                    monthlyrent: formData.monthlyrent,
                    deposit: formData.deposit,
                    advancepayment: formData.advancepayment,
                    start_date: formData.startdate,
                    remarks: formData.remarks,
                    owner_signature: signatureData,
                }),
            });

            const pdfData = await pdfResponse.json();
            if (!pdfResponse.ok) throw new Error(pdfData.error || "Failed to generate contract");

            // Save to backend
            const issueResponse = await fetch("http://localhost:5000/api/contracts/issuecontract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantid: formData.tenantid,
                    unitid: formData.unitid,
                    startdate: formData.startdate,
                    generated_contract: pdfData.filename,
                }),
            });

            if (!issueResponse.ok) throw new Error("Failed to issue contract record");

            // Show success modal instead of opening PDF immediately
            setSuccessModalData({
                applicantName: selectedApplicant.fullname,
                unitName: selectedApplicant.unit_name,
                startDate: formData.startdate,
                monthlyRent: formData.monthlyrent,
                issuedDate: new Date().toLocaleDateString(),
                contractId: pdfData.contract_id || `CONTRACT-${Date.now()}`,
                pdfUrl: pdfData.pdf_url || `http://localhost:5000/uploads/contracts/${pdfData.filename}`
            });

            // Close add modal and show success modal
            setShowAddModal(false);
            setShowSuccessModal(true);

            // ✅ IMPORTANT: Remove the issued applicant from the applicants list
            setApplicants(prevApplicants => 
                prevApplicants.filter(app => app.tenantid !== formData.tenantid)
            );

        } catch (error) {
            console.error("Error issuing contract:", error);
            alert("❌ Failed to issue contract. Please try again.");
        }
    };

    const handleViewContract = () => {
        // Use the correct PDF URL from successModalData
        if (successModalData?.pdfUrl) {
            window.open(successModalData.pdfUrl, "_blank");
        } else {
            console.error("PDF URL not available");
            alert("Contract PDF is not available. Please try generating again.");
        }
        setShowSuccessModal(false);
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        // Refresh data to get the updated contracts list
        fetchData();
    };

    // Function to view existing contracts
    const handleViewExistingContract = (contract) => {
        let contractUrl = '';
        
        if (contract.signed_contract) {
            contractUrl = `http://localhost:5000/uploads/signed_contracts/${contract.signed_contract}`;
        } else if (contract.generated_contract) {
            contractUrl = `http://localhost:5000/uploads/contracts/${contract.generated_contract}`;
        } else {
            console.error("No contract file found for:", contract);
            alert("Contract file not found. Please contact administrator.");
            return;
        }
        
        console.log("Opening contract URL:", contractUrl);
        window.open(contractUrl, "_blank");
    };

    // Calculate statistics - UPDATED to use current state
    const stats = {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'Active').length,
        pending: applicants.length // This will now update in real-time
    };

    return (
        <div className="Owner-Contract-container">
            {/* Header Section */}
            <div className="Owner-Contract-header">
                <div className="Owner-Contract-header-content">
                    <h1 className="Owner-Contract-title">Contract Management</h1>
                    <p className="Owner-Contract-subtitle">Manage tenant contracts and issue new agreements</p>
                </div>
                
                {/* Statistics Cards - NOW UPDATES IN REAL-TIME */}
                <div className="Owner-Contract-stats">
                    <div className="Owner-Contract-stat-card">
                        <div className="Owner-Contract-stat-icon total">
                            <FileText size={20} />
                        </div>
                        <div className="Owner-Contract-stat-info">
                            <span className="Owner-Contract-stat-number">{stats.total}</span>
                            <span className="Owner-Contract-stat-label">Total Contracts</span>
                        </div>
                    </div>
                    <div className="Owner-Contract-stat-card">
                        <div className="Owner-Contract-stat-icon active">
                            <User size={20} />
                        </div>
                        <div className="Owner-Contract-stat-info">
                            <span className="Owner-Contract-stat-number">{stats.active}</span>
                            <span className="Owner-Contract-stat-label">Active</span>
                        </div>
                    </div>
                    <div className="Owner-Contract-stat-card">
                        <div className="Owner-Contract-stat-icon pending">
                            <Clock size={20} />
                        </div>
                        <div className="Owner-Contract-stat-info">
                            <span className="Owner-Contract-stat-number">{stats.pending}</span>
                            <span className="Owner-Contract-stat-label">Pending</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - BADGES UPDATE IN REAL-TIME */}
            <div className="Owner-Contract-control-bar">
                <div className="Owner-Contract-tab-group">
                    <button
                        className={`Owner-Contract-tab-btn ${activeTab === "tenants" ? "Owner-Contract-tab-active" : ""}`}
                        onClick={() => setActiveTab("tenants")}
                    >
                        <FileText size={16} />
                        Active Contracts
                        <span className="Owner-Contract-tab-badge">{stats.total}</span>
                    </button>
                    <button
                        className={`Owner-Contract-tab-btn ${activeTab === "issue" ? "Owner-Contract-tab-active" : ""}`}
                        onClick={() => setActiveTab("issue")}
                    >
                        <User size={16} />
                        Issue New Contracts
                        <span className="Owner-Contract-tab-badge">{stats.pending}</span>
                    </button>
                </div>
            </div>

            {/* Active Contracts Tab */}
            {activeTab === "tenants" && (
                <div className="Owner-Contract-content-card">
                    <div className="Owner-Contract-table-header">
                        <h3>Active Contracts</h3>
                        <p>Manage and view all tenant rental agreements</p>
                    </div>

                    {loading ? (
                        <div className="Owner-Contract-loading">
                            <div className="Owner-Contract-loading-spinner"></div>
                            <p>Loading contracts...</p>
                        </div>
                    ) : (
                        <div className="Owner-Contract-grid">
                            {contracts.length === 0 ? (
                                <div className="Owner-Contract-empty">
                                    <FileText size={48} className="Owner-Contract-empty-icon" />
                                    <h3>No contracts found</h3>
                                    <p>There are no active contracts at the moment.</p>
                                </div>
                            ) : (
                                contracts.map((contract, index) => {
                                    const profileImage = getProfileImage(contract);
                                    return (
                                        <div className="Owner-Contract-card" key={index}>
                                            <div className="Owner-Contract-card-header">
                                                <div className="Owner-Contract-tenant-avatar">
                                                    {profileImage ? (
                                                        <>
                                                            <img 
                                                                src={profileImage} 
                                                                alt={contract.fullname}
                                                                className="Owner-Contract-avatar-image"
                                                                onError={(e) => handleImageError(e, contract)}
                                                            />
                                                            <div className="Owner-Contract-avatar-fallback" style={{display: 'none'}}>
                                                                <User size={20} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="Owner-Contract-avatar-fallback">
                                                            <User size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="Owner-Contract-tenant-info">
                                                    <h3>{contract.fullname}</h3>
                                                    <span className="Owner-Contract-tenant-email">{contract.email}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="Owner-Contract-card-details">
                                                <div className="Owner-Contract-detail-item">
                                                    <Home size={16} />
                                                    <span>{contract.unit_name}</span>
                                                </div>
                                                <div className="Owner-Contract-detail-item">
                                                    <DollarSign size={16} />
                                                    <span>₱{contract.unit_price}/month</span>
                                                </div>
                                                <div className="Owner-Contract-detail-item">
                                                    <Calendar size={16} />
                                                    <span>Started {new Date(contract.start_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <button
                                                className="Owner-Contract-view-btn"
                                                onClick={() => handleViewExistingContract(contract)}
                                            >
                                                <Download size={16} />
                                                View Contract
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Issue Contracts Tab - NOW UPDATES IN REAL-TIME */}
            {activeTab === "issue" && (
                <div className="Owner-Contract-content-card">
                    <div className="Owner-Contract-table-header">
                        <h3>Applicants Ready for Contract Issuance</h3>
                        <p>Select an applicant to generate and issue a rental contract</p>
                    </div>

                    {loading ? (
                        <div className="Owner-Contract-loading">
                            <div className="Owner-Contract-loading-spinner"></div>
                            <p>Loading applicants...</p>
                        </div>
                    ) : (
                        <div className="Owner-Contract-table-wrapper">
                            <table className="Owner-Contract-table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Contact Information</th>
                                        <th>Unit Details</th>
                                        <th>Monthly Rent</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.length > 0 ? (
                                        applicants.map((app, i) => {
                                            const profileImage = getProfileImage(app);
                                            return (
                                                <tr
                                                    key={i}
                                                    className={`Owner-Contract-table-row ${highlightedApplicantId === app.applicationid ? "Owner-Contract-highlight-row" : ""}`}
                                                >
                                                    <td>
                                                        <div className="Owner-Contract-applicant-info">
                                                            <span className="Owner-Contract-applicant-name">{app.fullname}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="Owner-Contract-contact-info">
                                                            <span className="Owner-Contract-contact-email">
                                                                <Mail size={12} />
                                                                {app.email}
                                                            </span>
                                                            <span className="Owner-Contract-contact-phone">
                                                                <Phone size={12} />
                                                                {app.phone}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="Owner-Contract-unit-info">
                                                            <Home size={12} />
                                                            {app.unit_name}
                                                        </div>
                                                    </td>
                                                    <td className="Owner-Contract-amount">
                                                        ₱{parseFloat(app.unit_price || 0).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="Owner-Contract-issue-btn"
                                                            onClick={() => openIssueModal(app)}
                                                        >
                                                            <FileText size={14} />
                                                            Issue Contract
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="Owner-Contract-empty-state">
                                                <User size={48} />
                                                <p>No applicants ready for contract issuance</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Issue Contract Modal */}
            {showAddModal && selectedApplicant && (
                <div className="Owner-Contract-modal-overlay">
                    <div className="Owner-Contract-modal Owner-Contract-issue-modal">
                        <div className="Owner-Contract-modal-header">
                            <h3>Issue Rental Contract</h3>
                            <button className="Owner-Contract-close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="Owner-Contract-modal-body">
                            {/* Applicant Summary */}
                            <div className="Owner-Contract-applicant-summary">
                                <div className="Owner-Contract-applicant-avatar">
                                    {getProfileImage(selectedApplicant) ? (
                                        <>
                                            <img 
                                                src={getProfileImage(selectedApplicant)} 
                                                alt={selectedApplicant.fullname}
                                                className="Owner-Contract-modal-avatar-image"
                                                onError={(e) => handleImageError(e, selectedApplicant)}
                                            />
                                            <div className="Owner-Contract-modal-avatar-fallback" style={{display: 'none'}}>
                                                <User size={24} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="Owner-Contract-modal-avatar-fallback">
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="Owner-Contract-applicant-details">
                                    <h4>{selectedApplicant.fullname}</h4>
                                    <p>{selectedApplicant.unit_name}</p>
                                </div>
                            </div>

                            {/* Contract Details Form */}
                            <div className="Owner-Contract-form-grid">
                                <div className="Owner-Contract-form-group">
                                    <label className="Owner-Contract-form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        name="startdate"
                                        value={formData.startdate}
                                        onChange={handleInputChange}
                                        className="Owner-Contract-form-input"
                                    />
                                </div>

                                <div className="Owner-Contract-form-group">
                                    <label className="Owner-Contract-form-label">Monthly Rent (₱) *</label>
                                    <input
                                        type="number"
                                        name="monthlyrent"
                                        value={formData.monthlyrent}
                                        onChange={handleInputChange}
                                        className="Owner-Contract-form-input"
                                    />
                                </div>

                                <div className="Owner-Contract-form-group">
                                    <label className="Owner-Contract-form-label">Security Deposit (₱) *</label>
                                    <input
                                        type="number"
                                        name="deposit"
                                        value={formData.deposit}
                                        onChange={handleInputChange}
                                        className="Owner-Contract-form-input"
                                    />
                                </div>

                                <div className="Owner-Contract-form-group">
                                    <label className="Owner-Contract-form-label">Advance Payment (₱) *</label>
                                    <input
                                        type="number"
                                        name="advancepayment"
                                        value={formData.advancepayment}
                                        onChange={handleInputChange}
                                        className="Owner-Contract-form-input"
                                    />
                                </div>
                            </div>

                            <div className="Owner-Contract-form-group">
                                <label className="Owner-Contract-form-label">Remarks</label>
                                <textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    className="Owner-Contract-form-textarea"
                                    placeholder="Additional contract notes..."
                                    rows="3"
                                />
                            </div>

                            {/* Signature Section */}
                            <div className="Owner-Contract-signature-section">
                                <label className="Owner-Contract-form-label">Owner Signature *</label>
                                <div className="Owner-Contract-signature-container">
                                    <SignatureCanvas
                                        ref={sigPadRef}
                                        penColor="black"
                                        canvasProps={{
                                            width: 400,
                                            height: 150,
                                            className: "Owner-Contract-sigCanvas",
                                        }}
                                    />
                                    <button className="Owner-Contract-clear-btn" onClick={clearSignature}>
                                        Clear Signature
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="Owner-Contract-modal-footer">
                            <button className="Owner-Contract-cancel-btn" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="Owner-Contract-generate-btn" onClick={handleGeneratePDF}>
                                <FileText size={16} />
                                Generate Contract PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ SUCCESS MODAL */}
            {showSuccessModal && successModalData && (
                <div className="Owner-Contract-success-modal-overlay">
                    <div className="Owner-Contract-success-modal">
                        <div className="Owner-Contract-success-modal-content">
                            <div className="Owner-Contract-success-animation-container">
                                <div className="Owner-Contract-success-checkmark">
                                    <CheckCircle size={80} className="Owner-Contract-check-icon" />
                                </div>
                                <div className="Owner-Contract-success-confetti">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="Owner-Contract-confetti-piece"></div>
                                    ))}
                                </div>
                            </div>
                            
                            <h2 className="Owner-Contract-success-title">Contract Created Successfully!</h2>
                            
                            <p className="Owner-Contract-success-message">
                                The rental contract has been generated and issued to the tenant.
                            </p>

                            <div className="Owner-Contract-success-details">
                                <div className="Owner-Contract-success-detail-item">
                                    <span className="Owner-Contract-detail-label">Applicant Name:</span>
                                    <span className="Owner-Contract-detail-value">
                                        {successModalData.applicantName}
                                    </span>
                                </div>
                                <div className="Owner-Contract-success-detail-item">
                                    <span className="Owner-Contract-detail-label">Unit:</span>
                                    <span className="Owner-Contract-detail-value">
                                        {successModalData.unitName}
                                    </span>
                                </div>
                                <div className="Owner-Contract-success-detail-item">
                                    <span className="Owner-Contract-detail-label">Start Date:</span>
                                    <span className="Owner-Contract-detail-value">
                                        {new Date(successModalData.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="Owner-Contract-success-detail-item">
                                    <span className="Owner-Contract-detail-label">Monthly Rent:</span>
                                    <span className="Owner-Contract-detail-value">
                                        ₱{parseFloat(successModalData.monthlyRent || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="Owner-Contract-success-detail-item">
                                    <span className="Owner-Contract-detail-label">Issued On:</span>
                                    <span className="Owner-Contract-detail-value">
                                        {successModalData.issuedDate}
                                    </span>
                                </div>
                            </div>

                            <div className="Owner-Contract-success-modal-actions">
                                <button 
                                    className="Owner-Contract-view-contract-btn"
                                    onClick={handleViewContract}
                                >
                                    <FileText size={16} />
                                    View Contract
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerContract;