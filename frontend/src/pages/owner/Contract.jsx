import React, { useState, useEffect } from "react";
import { Search, FileText, Plus, X } from "lucide-react";
import "../../styles/owners/Contract.css";

const OwnerContract = () => {
    const [activeTab, setActiveTab] = useState("tenants"); // "tenants" | "issue"
    const [contracts, setContracts] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [formData, setFormData] = useState({
        tenantid: "",
        startdate: "",
        monthlyrent: "",
        deposit: "",
        advancepayment: "",
        remarks: "",
    });

    // Fetch data for both tabs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contractsRes, applicantsRes] = await Promise.all([
                    fetch("http://localhost:5000/api/contracts/tenants"),
                    fetch("http://localhost:5000/api/contracts/applicants"),
                ]);
                const contractsData = await contractsRes.json();
                const applicantsData = await applicantsRes.json();
                setContracts(contractsData);
                setApplicants(applicantsData);
            } catch (error) {
                console.error("Error loading contracts:", error);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openIssueModal = (applicant) => {
        setSelectedApplicant(applicant);
        const today = new Date().toISOString().split("T")[0];
        setFormData({
            tenantid: applicant.applicationid,
            startdate: today,
            enddate: "",
            monthlyrent: applicant.unit_price,
            deposit: applicant.unit_price,
            advancepayment: applicant.unit_price,
            remarks: `Contract for ${applicant.fullname} (${applicant.unit_name})`,
        });
        setShowAddModal(true);
    };

    const handleIssueContract = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/contracts/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Contract successfully issued!");
                setApplicants((prev) =>
                    prev.filter((app) => app.applicationid !== selectedApplicant.applicationid)
                );
                setShowAddModal(false);
                setSelectedApplicant(null);
            } else {
                alert("Failed to issue contract.");
            }
        } catch (error) {
            console.error("Error issuing contract:", error);
        }
    };

    return (
        <div className="contracts-page-container">
            <div className="content-card header-card">
                <h2>Contracts Management</h2>
                <p>Manage and issue rental contracts for tenants and new applicants.</p>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={activeTab === "tenants" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("tenants")}
                >
                    Tenant Contracts
                </button>
                <button
                    className={activeTab === "issue" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("issue")}
                >
                    Issue New Contracts
                </button>
            </div>

            {/* Tenant Contracts Table */}
            {activeTab === "tenants" && (
                <div className="content-card contract-area">
                    <div className="contract-control-bar">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search Tenant or Contract" />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Unit</th>
                                <th>Start Date</th>
                                <th>Monthly Rent</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((contract, i) => (
                                <tr key={i}>
                                    <td>{contract.fullname}</td>
                                    <td>{contract.unit_name}</td>
                                    <td>{contract.startdate}</td>
                                    <td>{contract.enddate}</td>
                                    <td>₱{contract.monthlyrent}</td>
                                    <td>
                                        <span className="status-badge status-active">Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Issue New Contracts */}
            {activeTab === "issue" && (
                <div className="content-card applicant-area">
                    <h3>Applicants Ready for Contract Issuance</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Unit</th>
                                <th>Rent</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((app, i) => (
                                <tr key={i}>
                                    <td>{app.fullname}</td>
                                    <td>{app.email}</td>
                                    <td>{app.phone}</td>
                                    <td>{app.unit_name}</td>
                                    <td>₱{app.unit_price}</td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            onClick={() => openIssueModal(app)}
                                        >
                                            <FileText size={16} /> Issue Contract
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Issue Contract Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="add-contract-modal">
                        <div className="modal-header">
                            <h3>Issue Contract</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p><strong>Applicant:</strong> {selectedApplicant?.fullname}</p>
                            <p><strong>Unit:</strong> {selectedApplicant?.unit_name}</p>

                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startdate"
                                value={formData.startdate}
                                onChange={handleInputChange}
                            />

                            

                            <label>Monthly Rent</label>
                            <input
                                type="number"
                                name="monthlyrent"
                                value={formData.monthlyrent}
                                onChange={handleInputChange}
                            />

                            <label>Deposit</label>
                            <input
                                type="number"
                                name="deposit"
                                value={formData.deposit}
                                onChange={handleInputChange}
                            />

                            <label>Advance Payment</label>
                            <input
                                type="number"
                                name="advancepayment"
                                value={formData.advancepayment}
                                onChange={handleInputChange}
                            />

                            <label>Remarks</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="modal-footer">
                            <button className="save-btn" onClick={handleIssueContract}>
                                Save Contract
                            </button>
                            <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerContract;
