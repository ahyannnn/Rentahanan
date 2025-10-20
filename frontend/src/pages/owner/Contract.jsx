import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FileText, X } from "lucide-react";
import "../../styles/owners/Contract.css";

const OwnerContract = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("tenants");
    const [contracts, setContracts] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [highlightedApplicantId, setHighlightedApplicantId] = useState(null);
    const [formData, setFormData] = useState({
        tenantid: "",
        startdate: "",
        monthlyrent: "",
        deposit: "",
        advancepayment: "",
        remarks: "",
    });

    // ✅ Auto-open tab & highlight applicant when coming from navigation
    useEffect(() => {
        if (location.state?.openTab === "issue") {
            setActiveTab("issue");
            if (location.state?.selectedApplicantId) {
                setHighlightedApplicantId(location.state.selectedApplicantId);
            }
        }
    }, [location.state]);

    // ✅ Fetch contracts and applicants
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

                // Auto-open modal if a highlighted applicant exists
                if (location.state?.selectedApplicantId) {
                    const foundApplicant = applicantsData.find(
                        (a) => a.applicationid === location.state.selectedApplicantId
                    );
                    if (foundApplicant) openIssueModal(foundApplicant);
                }
            } catch (error) {
                console.error("Error loading contracts:", error);
            }
        };
        fetchData();
    }, []);

    // ✅ Handle form inputs
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

    const handleGeneratePDF = async () => {
        try {
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
                }),
            });

            const pdfData = await pdfResponse.json();
            if (!pdfResponse.ok) throw new Error(pdfData.error || "Failed to generate contract");

            console.log("PDF generated:", pdfData.pdf_url);

            // ✅ Use this URL
            window.open(pdfData.pdf_url, "_blank");


            const issueResponse = await fetch("http://localhost:5000/api/contracts/issuecontract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantid: formData.tenantid,
                    unitid: formData.unitid,
                    startdate: formData.startdate,
                    generated_contract: pdfData.file_path,
                }),
            });

            if (!issueResponse.ok) throw new Error("Failed to issue contract record");

            alert("✅ Contract successfully generated and issued!");
            setShowAddModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Error issuing contract:", error);
            alert("❌ Failed to issue contract. Please try again.");
        }
    };



    return (
        <div className="contracts-page-container">
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

            {/* Issue New Contracts Tab */}
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
                                <tr
                                    key={i}
                                    className={
                                        highlightedApplicantId === app.applicationid ? "highlight-row" : ""
                                    }
                                >
                                    <td>{app.fullname}</td>
                                    <td>{app.email}</td>
                                    <td>{app.phone}</td>
                                    <td>{app.unit_name}</td>
                                    <td>₱{app.unit_price}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => openIssueModal(app)}>
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
            {showAddModal && selectedApplicant && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Issue Contract for {selectedApplicant.fullname}</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <label>Start Date:</label>
                            <input
                                type="date"
                                name="startdate"
                                value={formData.startdate}
                                onChange={handleInputChange}
                            />

                            <label>Monthly Rent (₱):</label>
                            <input
                                type="number"
                                name="monthlyrent"
                                value={formData.monthlyrent}
                                onChange={handleInputChange}
                            />

                            <label>Deposit (₱):</label>
                            <input
                                type="number"
                                name="deposit"
                                value={formData.deposit}
                                onChange={handleInputChange}
                            />

                            <label>Advance Payment (₱):</label>
                            <input
                                type="number"
                                name="advancepayment"
                                value={formData.advancepayment}
                                onChange={handleInputChange}
                            />

                            <label>Remarks:</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                            />

                            <div className="modal-actions">
                                <button className="generate-btn" onClick={handleGeneratePDF}>
                                    Generate Contract PDF
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
