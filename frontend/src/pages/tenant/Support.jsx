import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Clock, CheckCircle, AlertCircle, Home, DollarSign, Settings, HelpCircle, X, Upload, Image, Trash2 } from "lucide-react";
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [concernToDelete, setConcernToDelete] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.tenantid) {
                setFormData((prev) => ({ ...prev, tenantid: parsedUser.tenantid }));
                fetchConcerns(parsedUser.tenantid);
            }
        }
    }, []);

    const fetchConcerns = (tenantId) => {
        fetch(`http://localhost:5000/api/get-concerns/${tenantId}`)
            .then((res) => res.json())
            .then((data) => setConcerns(data))
            .catch((err) => console.error("Error fetching concerns:", err));
    };

    const handleOpenNewConcernModal = () => setIsNewConcernModalOpen(true);
    const handleCloseNewConcernModal = () => {
        setIsNewConcernModalOpen(false);
        setFormData({
            ...formData,
            concerntype: "",
            subject: "",
            description: "",
            tenantimage: null,
        });
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, tenantimage: e.target.files[0] });
    };

    const handleSubmitConcern = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.tenantid || !formData.concerntype || !formData.subject || !formData.description || !formData.tenantimage) {
            alert("⚠️ All fields including an image are required!");
            setIsSubmitting(false);
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
                setShowSuccessModal(true);
                fetchConcerns(formData.tenantid);
                handleCloseNewConcernModal();
            } else {
                alert(data.error || "❌ Failed to submit concern");
            }
        } catch (error) {
            console.error("Error submitting concern:", error);
            alert("❌ Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    // ✅ Delete concern function
    const handleDeleteClick = (concernId, e) => {
        if (e) e.stopPropagation();
        const concern = concerns.find(c => c.concernid === concernId);
        setConcernToDelete(concern);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!concernToDelete) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/delete-concern-tenant/${concernToDelete.concernid}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                // Remove from local state
                setConcerns(concerns.filter(concern => concern.concernid !== concernToDelete.concernid));
                setShowDeleteModal(false);
                setConcernToDelete(null);
                
                if (data.permanent_delete) {
                    alert("✅ Concern permanently deleted (both you and owner deleted it)");
                } else {
                    alert("✅ Concern removed from your view!");
                }
            } else {
                alert(data.error || "❌ Failed to delete concern");
            }
        } catch (error) {
            console.error("Error deleting concern:", error);
            alert("❌ Something went wrong. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setConcernToDelete(null);
    };

    const filteredConcerns = concerns.filter((concern) => {
        const matchesSearch =
            concern.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            concern.concerntype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            concern.concernid?.toString().includes(searchTerm);
        
        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "pending") return concern.status === "Pending" && matchesSearch;
        if (activeFilter === "completed") return concern.status === "Resolved" && matchesSearch;
        return matchesSearch;
    });

    const getStatusIcon = (status) => {
        return status === "Pending" ? <Clock size={16} /> : <CheckCircle size={16} />;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            Maintenance: <Settings size={18} />,
            Billing: <DollarSign size={18} />,
            Contract: <FileText size={18} />,
            Other: <HelpCircle size={18} />,
        };
        return icons[category] || <HelpCircle size={18} />;
    };

    const statsData = {
        total: concerns.length,
        pending: concerns.filter((c) => c.status === "Pending").length,
        resolved: concerns.filter((c) => c.status === "Resolved").length
    };

    return (
        <div className="support-container-Tenant-Support">
            {/* Header */}
            <div className="page-header-Tenant-Support">
                <div className="header-content-Tenant-Support">
                    <h2 className="page-title-Tenant-Support">Support & Concerns</h2>
                    <p className="page-description-Tenant-Support">
                        Track the status of your reported issues and create new concerns
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview-Tenant-Support">
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support total">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">{statsData.total}</div>
                        <div className="stat-label-Tenant-Support">Total Concerns</div>
                    </div>
                </div>
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support pending">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">{statsData.pending}</div>
                        <div className="stat-label-Tenant-Support">Pending</div>
                    </div>
                </div>
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support resolved">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">{statsData.resolved}</div>
                        <div className="stat-label-Tenant-Support">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="support-top-controls-Tenant-Support">
                <div className="search-container-Tenant-Support">
                    <div className="search-box-Tenant-Support">
                        <Search size={20} className="search-icon-Tenant-Support" />
                        <input
                            type="text"
                            placeholder="Search concerns by ID, subject, or type..."
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
                            <span className="filter-count-Tenant-Support">{concerns.length}</span>
                        </button>
                        <button
                            className={`filter-btn-Tenant-Support ${
                                activeFilter === "pending" ? "filter-btn-active-Tenant-Support" : ""
                            }`}
                            onClick={() => setActiveFilter("pending")}
                        >
                            Pending
                            <span className="filter-count-Tenant-Support">{statsData.pending}</span>
                        </button>
                        <button
                            className={`filter-btn-Tenant-Support ${
                                activeFilter === "completed" ? "filter-btn-active-Tenant-Support" : ""
                            }`}
                            onClick={() => setActiveFilter("completed")}
                        >
                            Resolved
                            <span className="filter-count-Tenant-Support">{statsData.resolved}</span>
                        </button>
                    </div>

                    <button className="new-concern-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>
                        <Plus size={20} />
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
                                        <span className="meta-value-Tenant-Support">#{concern.concernid}</span>
                                    </div>
                                    <div className="meta-item-Tenant-Support">
                                        <span className="meta-label-Tenant-Support">Date Reported</span>
                                        <span className="meta-value-Tenant-Support date-value-Tenant-Support">
                                            <Clock size={14} />
                                            {concern.creationdate}
                                        </span>
                                    </div>
                                </div>

                                <div className="image-actions-Tenant-Support">
                                    {concern.tenantimage && (
                                        <button
                                            className="view-image-btn-Tenant-Support"
                                            onClick={() =>
                                                window.open(`http://localhost:5000${concern.tenantimage}`, "_blank")
                                            }
                                        >
                                            <Image size={16} />
                                            View Image
                                        </button>
                                    )}
                                    {concern.landlordimage && (
                                        <button
                                            className="view-image-btn-Tenant-Support landlord"
                                            onClick={() =>
                                                window.open(`http://localhost:5000${concern.landlordimage}`, "_blank")
                                            }
                                        >
                                            <Image size={16} />
                                            Owner's Response
                                        </button>
                                    )}
                                    {/* Delete Button - Only show for resolved concerns */}
                                    {concern.status === "Resolved" && (
                                        <button
                                            className="delete-concern-btn-Tenant-Support"
                                            onClick={(e) => handleDeleteClick(concern.concernid, e)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 size={16} />
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-concerns-Tenant-Support">
                        <div className="no-concerns-icon-Tenant-Support">
                            <FileText size={64} />
                        </div>
                        <h3 className="no-concerns-title-Tenant-Support">No concerns found</h3>
                        <p className="no-concerns-description-Tenant-Support">
                            {searchTerm
                                ? "No concerns match your search criteria."
                                : "You haven't reported any concerns yet."}
                        </p>
                        {!searchTerm && (
                            <button className="no-concerns-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>
                                <Plus size={20} />
                                Report Your First Concern
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* New Concern Modal */}
            {isNewConcernModalOpen && (
                <div className="modal-overlay-Tenant-Support" onClick={handleCloseNewConcernModal}>
                    <div className="concern-modal-Tenant-Support" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-Tenant-Support">
                            <button className="back-btn-Tenant-Support" onClick={handleCloseNewConcernModal}>
                                <X size={20} />
                            </button>
                            <h3 className="modal-title-Tenant-Support">Create New Concern</h3>
                            <div className="modal-header-spacer-Tenant-Support"></div>
                        </div>

                        <div className="modal-content-Tenant-Support">
                            <form className="concern-form-Tenant-Support" onSubmit={handleSubmitConcern}>
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concerntype" className="form-label-Tenant-Support">
                                        <Settings size={18} />
                                        Concern Type *
                                    </label>
                                    <select 
                                        id="concerntype" 
                                        className="form-input-Tenant-Support" 
                                        required 
                                        onChange={handleInputChange}
                                        value={formData.concerntype}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Billing">Billing</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="subject" className="form-label-Tenant-Support">
                                        <FileText size={18} />
                                        Subject / Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="form-input-Tenant-Support"
                                        placeholder="e.g., Water Leakage in Unit 1"
                                        required
                                        onChange={handleInputChange}
                                        value={formData.subject}
                                    />
                                </div>

                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="description" className="form-label-Tenant-Support">
                                        <HelpCircle size={18} />
                                        Details / Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        className="form-input-Tenant-Support textarea-Tenant-Support"
                                        rows="4"
                                        placeholder="Please provide detailed information about your concern..."
                                        required
                                        onChange={handleInputChange}
                                        value={formData.description}
                                    ></textarea>
                                </div>

                                <div className="form-group-Tenant-Support">
                                    <label className="form-label-Tenant-Support">
                                        <Upload size={18} />
                                        Attachment *
                                    </label>
                                    <div className="upload-container-Tenant-Support">
                                        <div className="upload-box-Tenant-Support">
                                            <div className="upload-icon-Tenant-Support">
                                                <Image size={32} />
                                            </div>
                                            <div className="upload-text-Tenant-Support">
                                                <p className="upload-title-Tenant-Support">Upload supporting image</p>
                                                <p className="upload-subtitle-Tenant-Support">
                                                    Supports JPG, PNG up to 10MB
                                                </p>
                                            </div>
                                            <label className="upload-btn-Tenant-Support">
                                                Choose File
                                                <input
                                                    type="file"
                                                    className="file-input-Tenant-Support"
                                                    onChange={handleFileChange}
                                                    required
                                                    accept="image/*"
                                                />
                                            </label>
                                            {formData.tenantimage && (
                                                <div className="file-preview-Tenant-Support">
                                                    Selected: {formData.tenantimage.name}
                                                </div>
                                            )}
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
                                        <button 
                                            type="submit" 
                                            className="submit-btn-Tenant-Support"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="loading-spinner-Tenant-Support"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    Submit Concern
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay-Tenant-Support success-modal-overlay">
                    <div className="success-modal-Tenant-Support">
                        <div className="success-modal-content-Tenant-Support">
                            <div className="success-animation-container-Tenant-Support">
                                <div className="success-checkmark-Tenant-Support">
                                    <CheckCircle size={80} className="check-icon-Tenant-Support" />
                                </div>
                                <div className="success-confetti-Tenant-Support">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="confetti-piece-Tenant-Support"></div>
                                    ))}
                                </div>
                            </div>
                            
                            <h2 className="success-title-Tenant-Support">Concern Submitted Successfully!</h2>
                            
                            <p className="success-message-Tenant-Support">
                                Your concern has been submitted and is now under review. We'll get back to you within 24-48 hours.
                            </p>

                            <div className="success-details-Tenant-Support">
                                <div className="success-detail-item-Tenant-Support">
                                    <span className="detail-label-Tenant-Support">Status:</span>
                                    <span className="detail-value-Tenant-Support">
                                        <span className="status-badge-pending-Tenant-Support">
                                            <Clock size={14} />
                                            Pending Review
                                        </span>
                                    </span>
                                </div>
                                <div className="success-detail-item-Tenant-Support">
                                    <span className="detail-label-Tenant-Support">Submitted:</span>
                                    <span className="detail-value-Tenant-Support">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button 
                                className="success-close-btn-Tenant-Support"
                                onClick={handleCloseSuccessModal}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ DELETE CONFIRMATION MODAL */}
            {showDeleteModal && concernToDelete && (
                <div className="modal-overlay-Tenant-Support delete-modal-overlay-Tenant-Support">
                    <div className="delete-modal-Tenant-Support">
                        <div className="delete-modal-icon-Tenant-Support">
                            <Trash2 size={48} />
                        </div>
                        <div className="delete-modal-content-Tenant-Support">
                            <h3 className="delete-modal-title-Tenant-Support">Delete From Your View?</h3>
                            <p className="delete-modal-message-Tenant-Support">
                                This concern will be removed from your view but the owner will still see it. 
                                If both you and the owner delete this concern, it will be permanently deleted including all images.
                            </p>
                            <div className="delete-modal-details-Tenant-Support">
                                <p><strong>Issue:</strong> {concernToDelete.subject}</p>
                                <p><strong>Type:</strong> {concernToDelete.concerntype}</p>
                                <p><strong>Date Reported:</strong> {concernToDelete.creationdate}</p>
                            </div>
                        </div>
                        <div className="delete-modal-actions-Tenant-Support">
                            <button 
                                className="delete-cancel-btn-Tenant-Support" 
                                onClick={cancelDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-confirm-btn-Tenant-Support" 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="loading-spinner-Tenant-Support"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Remove From My View"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;