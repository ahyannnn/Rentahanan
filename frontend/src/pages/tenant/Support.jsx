import React, { useState, useEffect } from "react";
import "../../styles/tenant/Support.css";

const Support = () => {
    const [isNewConcernModalOpen, setIsNewConcernModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [concerns, setConcerns] = useState([]);
    const [formData, setFormData] = useState({
        tenantid: "",
        concerntype: "",
        subject: "",
        description: "",
        tenantimage: null,
    });

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.tenantid) {
                setFormData((prev) => ({ ...prev, tenantid: parsedUser.tenantid }));
                fetch(`http://localhost:5000/api/get-concerns/${parsedUser.tenantid}`)
                    .then((res) => res.json())
                    .then((data) => setConcerns(data))
                    .catch((err) => console.error("Error fetching concerns:", err));
            }
        }
    }, []);

    const handleOpenNewConcernModal = () => setIsNewConcernModalOpen(true);
    const handleCloseNewConcernModal = () => setIsNewConcernModalOpen(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, tenantimage: e.target.files[0] });
    };

    const handleSubmitConcern = async (e) => {
        e.preventDefault();

        if (!formData.tenantid || !formData.concerntype || !formData.subject || !formData.description || !formData.tenantimage) {
            alert("⚠️ All fields including an image are required!");
            return;
        }

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach((key) => {
                formDataToSend.append(key, formData[key]);
            });

            const res = await fetch("http://localhost:5000/api/add-concerns", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Concern submitted successfully!");
                setConcerns([data.concern, ...concerns]);
                setIsNewConcernModalOpen(false);
                setFormData({
                    tenantid: formData.tenantid,
                    concerntype: "",
                    subject: "",
                    description: "",
                    tenantimage: null,
                });
            } else {
                alert(data.error || "❌ Failed to submit concern");
            }
        } catch (error) {
            console.error("Error submitting concern:", error);
            alert("❌ Something went wrong. Please try again.");
        }
    };

    const filteredConcerns = concerns.filter((concern) => {
        const matchesSearch =
            concern.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            concern.concerntype?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "pending") return concern.status === "Pending" && matchesSearch;
        if (activeFilter === "completed") return concern.status === "Resolved" && matchesSearch;
        return matchesSearch;
    });

    const getStatusIcon = (status) => (status === "Pending" ? "⏳" : "✅");
    const getCategoryIcon = (category) => {
        const icons = {
            Maintenance: "🔧",
            Billing: "💰",
            Contract: "📝",
            Other: "❓",
        };
        return icons[category] || "📄";
    };

    return (
        <div className="support-container-Tenant-Support">
            {/* Header */}
            <div className="page-header-Tenant-Support">
                <h2 className="page-title-Tenant-Support">Support & Concerns 🛠️</h2>
                <p className="page-description-Tenant-Support">
                    Track the status of your reported issues and create new concerns.
                </p>
            </div>

            {/* Stats */}
            <div className="stats-overview-Tenant-Support">
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support">📋</div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">{concerns.length}</div>
                        <div className="stat-label-Tenant-Support">Total Concerns</div>
                    </div>
                </div>
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support">⏳</div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">
                            {concerns.filter((c) => c.status === "Pending").length}
                        </div>
                        <div className="stat-label-Tenant-Support">Pending</div>
                    </div>
                </div>
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support">✅</div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">
                            {concerns.filter((c) => c.status === "Resolved").length}
                        </div>
                        <div className="stat-label-Tenant-Support">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="support-top-controls-Tenant-Support">
                <div className="search-container-Tenant-Support">
                    <div className="search-box-Tenant-Support">
                        <span className="search-icon-Tenant-Support">🔍</span>
                        <input
                            type="text"
                            placeholder="Search Concern ID or Title..."
                            className="search-input-Tenant-Support"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="controls-right-Tenant-Support">
                    <div className="filter-tabs-Tenant-Support">
                        <button
                            className={`filter-btn-Tenant-Support ${
                                activeFilter === "all" ? "filter-btn-active-Tenant-Support" : ""
                            }`}
                            onClick={() => setActiveFilter("all")}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn-Tenant-Support ${
                                activeFilter === "pending" ? "filter-btn-active-Tenant-Support" : ""
                            }`}
                            onClick={() => setActiveFilter("pending")}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn-Tenant-Support ${
                                activeFilter === "completed" ? "filter-btn-active-Tenant-Support" : ""
                            }`}
                            onClick={() => setActiveFilter("completed")}
                        >
                            Resolved
                        </button>
                    </div>

                    <button className="new-concern-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>
                        <span className="btn-icon-Tenant-Support">+</span>
                        New Concern
                    </button>
                </div>
            </div>

            {/* Concerns List */}
            <div className="concerns-list-Tenant-Support">
                {filteredConcerns.length > 0 ? (
                    filteredConcerns.map((concern) => (
                        <div key={concern.concernid} className="concern-card-Tenant-Support">
                            <div className="card-header-Tenant-Support">
                                <div className="category-badge-Tenant-Support">
                                    <span className="category-icon-Tenant-Support">
                                        {getCategoryIcon(concern.concerntype)}
                                    </span>
                                    {concern.concerntype}
                                </div>
                                <span
                                    className={`concern-status-Tenant-Support status-${concern.status.toLowerCase()}-Tenant-Support`}
                                >
                                    <span className="status-icon-Tenant-Support">
                                        {getStatusIcon(concern.status)}
                                    </span>
                                    {concern.status}
                                </span>
                            </div>

                            <div className="concern-content-Tenant-Support">
                                <h4 className="concern-title-Tenant-Support">{concern.subject}</h4>
                                <p className="concern-description-Tenant-Support">{concern.description}</p>
                            </div>

                            <div className="card-footer-Tenant-Support">
                                <div className="concern-meta-Tenant-Support">
                                    <div className="meta-item-Tenant-Support">
                                        <span className="meta-label-Tenant-Support">Concern ID</span>
                                        <span className="meta-value-Tenant-Support">{concern.concernid}</span>
                                    </div>
                                    <div className="meta-item-Tenant-Support">
                                        <span className="meta-label-Tenant-Support">Date Reported</span>
                                        <span className="meta-value-Tenant-Support date-value-Tenant-Support">
                                            📅 {concern.creationdate}
                                        </span>
                                    </div>
                                </div>

                                {/* 🔹 View Image Buttons */}
                                <div className="view-image-btn-Tenant-Support">
                                    {concern.tenantimage && (
                                        <button
                                            className="view-details-btn-Tenant-Support"
                                            onClick={() =>
                                                window.open(`http://localhost:5000${concern.tenantimage}`, "_blank")
                                            }
                                        >
                                            View Image
                                        </button>
                                    )}
                                    {concern.landlordimage && (
                                        <button
                                            className="view-details-btn-Tenant-Support"
                                            onClick={() =>
                                                window.open(`http://localhost:5000${concern.landlordimage}`, "_blank")
                                            }
                                        >
                                            View Image
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-concerns-Tenant-Support">
                        <div className="no-concerns-icon-Tenant-Support">📝</div>
                        <h3 className="no-concerns-title-Tenant-Support">No concerns found</h3>
                        <p className="no-concerns-description-Tenant-Support">
                            {searchTerm
                                ? "No concerns match your search criteria."
                                : "You haven't reported any concerns yet."}
                        </p>
                        {!searchTerm && (
                            <button className="no-concerns-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>
                                Report Your First Concern
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal (unchanged) */}
            {isNewConcernModalOpen && (
                <div className="modal-overlay-Tenant-Support" onClick={handleCloseNewConcernModal}>
                    <div className="concern-modal-Tenant-Support" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-Tenant-Support">
                            <button className="back-btn-Tenant-Support" onClick={handleCloseNewConcernModal}>
                                ← Back
                            </button>
                            <h3 className="modal-title-Tenant-Support">Create New Concern 🆕</h3>
                            <div className="modal-header-spacer-Tenant-Support"></div>
                        </div>

                        <div className="modal-content-Tenant-Support">
                            <form className="concern-form-Tenant-Support" onSubmit={handleSubmitConcern}>
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concerntype" className="form-label-Tenant-Support">
                                        📋 Concern Type *
                                    </label>
                                    <select id="concerntype" className="form-input-Tenant-Support" required onChange={handleInputChange}>
                                        <option value="">Select Category</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Billing">Billing</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="subject" className="form-label-Tenant-Support">
                                        💬 Subject / Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="form-input-Tenant-Support"
                                        placeholder="e.g., Water Leakage in Unit 1"
                                        required
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="description" className="form-label-Tenant-Support">
                                        📝 Details / Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        className="form-input-Tenant-Support textarea-Tenant-Support"
                                        rows="4"
                                        placeholder="Please provide details..."
                                        required
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="form-group-Tenant-Support">
                                    <label className="form-label-Tenant-Support">📎 Attachment *</label>
                                    <div className="upload-container-Tenant-Support">
                                        <div className="upload-box-Tenant-Support">
                                            <div className="upload-icon-Tenant-Support">📁</div>
                                            <div className="upload-text-Tenant-Support">
                                                <p className="upload-title-Tenant-Support">Upload supporting documents</p>
                                                <p className="upload-subtitle-Tenant-Support">
                                                    Supports JPG, PNG, PDF up to 10MB
                                                </p>
                                            </div>
                                            <label className="upload-btn-Tenant-Support">
                                                Choose File
                                                <input
                                                    type="file"
                                                    className="file-input-Tenant-Support"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer-Tenant-Support">
                                    <div className="footer-actions-Tenant-Support">
                                        <button
                                            type="button"
                                            className="cancel-btn-Tenant-Support"
                                            onClick={handleCloseNewConcernModal}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="submit-btn-Tenant-Support">
                                            🚀 Submit Concern
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
