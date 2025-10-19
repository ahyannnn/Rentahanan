import React, { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import "../../styles/owners/Billing.css";

function Billing() {
    const [activeTab, setActiveTab] = useState("tenants"); // "tenants" | "applicants"
    const [showAddModal, setShowAddModal] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [formData, setFormData] = useState({
        tenantId: "",
        invoiceNo: "",
        billType: "Security Deposit & Advance Payment",
        amount: "",
        description: "",
        issuedDate: "",
        dueDate: ""
    });

    // ✅ Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // Fetch tenants and applicants
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tenantsRes, applicantsRes] = await Promise.all([
                    fetch("http://localhost:5000/api/billing/bills"),
                    fetch("http://localhost:5000/api/applicants/for-billing")
                ]);
                const tenantsData = await tenantsRes.json();
                const applicantsData = await applicantsRes.json();
                setTenants(tenantsData);
                setApplicants(applicantsData);
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

    // ✅ Open invoice modal with pre-filled data
    const openInvoiceModal = (applicant) => {
        setSelectedApplicant(applicant);

        const today = getTodayDate();

        setFormData({
            tenantId: applicant.applicationid,
            invoiceNo: `INV-${Date.now()}`, // optional: auto-generate invoice number
            billType: "Security Deposit & Advance Payment",
            amount: applicant.unit_price * 3 || "",
            description: `Initial payment for ${applicant.fullname} (${applicant.unit_name})`,
            issuedDate: today,
            dueDate: "" // leave empty to be chosen by user
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
                    dueDate: ""
                });
            } else {
                alert("Failed to create invoice.");
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            alert("An error occurred while creating the invoice.");
        }
    };

    return (
        <div className="billing-page-container">
            {/* Header */}
            <div className="content-card header-card">
                <h2>Billing & Invoicing</h2>
                <p>Manage monthly tenant invoices and issue initial payments for applicants.</p>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={activeTab === "tenants" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("tenants")}
                >
                    Tenant Invoices
                </button>
                <button
                    className={activeTab === "applicants" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("applicants")}
                >
                    Applicant Initial Payments
                </button>
            </div>

            {/* Applicant Initial Payments */}
            {activeTab === "applicants" && (
                <div className="content-card applicant-area">
                    <h3>Applicants Requiring Initial Payment</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Unit</th>
                                <th>Monthly Rent</th>
                                <th>Actions</th>
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
                                            onClick={() => openInvoiceModal(app)}
                                        >
                                            Issue Initial Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Invoice Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="add-invoice-modal">
                        <div className="modal-header">
                            <h3>Issue Initial Payment Invoice</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p><strong>Applicant:</strong> {selectedApplicant?.fullname}</p>
                            <p><strong>Unit:</strong> {selectedApplicant?.unit_name}</p>

                            <label>Bill Type</label>
                            <select
                                name="billType"
                                value={formData.billType}
                                onChange={handleInputChange}
                            >
                                <option>Security Deposit & Advance Payment</option>
                                <option>Advance Rent Only</option>
                                <option>Security Deposit Only</option>
                            </select>

                            <label>Amount (₱)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                            />

                            <label>Issued Date</label>
                            <input
                                type="date"
                                name="issuedDate"
                                value={formData.issuedDate}
                                onChange={handleInputChange}
                            />

                            <label>Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                            />

                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="modal-footer">
                            <button className="save-btn" onClick={handleSaveInvoice}>
                                Save
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
}
    
export default Billing;
