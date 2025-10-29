import React, { useState } from "react";
import "../../styles/tenant/Support.css";

const Support = () => {
    const [isNewConcernModalOpen, setIsNewConcernModalOpen] = useState(false); 
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    
    const concerns = [
        { id: 'C-2025-001', category: "Maintenance", title: "Water leakage in the unit", date: "2024-01-15", status: "Pending" },
        { id: 'C-2025-002', category: "Billing", title: "Billing inquiry for monthly payment", date: "2024-01-10", status: "Pending" },
        { id: 'C-2025-003', category: "Contract", title: "Contract renewal discussion", date: "2024-01-08", status: "Pending" },
        { id: 'C-2025-004', category: "Other", title: "General inquiry about community rules", date: "2024-01-05", status: "Resolved" },
    ];

    const handleOpenNewConcernModal = () => setIsNewConcernModalOpen(true);
    const handleCloseNewConcernModal = () => setIsNewConcernModalOpen(false);

    const filteredConcerns = concerns.filter(concern => {
        const matchesSearch = concern.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            concern.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "pending") return concern.status === "Pending" && matchesSearch;
        if (activeFilter === "completed") return concern.status === "Resolved" && matchesSearch;
        return matchesSearch;
    });

    const getStatusIcon = (status) => {
        return status === "Pending" ? "⏳" : "✅";
    };

    const getCategoryIcon = (category) => {
        const icons = {
            "Maintenance": "🔧",
            "Billing": "💰", 
            "Contract": "📝",
            "Other": "❓"
        };
        return icons[category] || "📄";
    };

    return (
        <div className="support-container-Tenant-Support">
            
            {/* Page Header */}
            <div className="page-header-Tenant-Support">
                <h2 className="page-title-Tenant-Support">Support & Concerns 🛠️</h2>
                <p className="page-description-Tenant-Support">Track the status of your reported issues and create new concerns.</p>
            </div>

            {/* Stats Overview */}
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
                        <div className="stat-number-Tenant-Support">{concerns.filter(c => c.status === "Pending").length}</div>
                        <div className="stat-label-Tenant-Support">Pending</div>
                    </div>
                </div>
                <div className="stat-card-Tenant-Support">
                    <div className="stat-icon-Tenant-Support">✅</div>
                    <div className="stat-content-Tenant-Support">
                        <div className="stat-number-Tenant-Support">{concerns.filter(c => c.status === "Resolved").length}</div>
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
                    {/* Filter Tabs */}
                    <div className="filter-tabs-Tenant-Support">
                        <button 
                            className={`filter-btn-Tenant-Support ${activeFilter === "all" ? "filter-btn-active-Tenant-Support" : ""}`}
                            onClick={() => setActiveFilter("all")}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn-Tenant-Support ${activeFilter === "pending" ? "filter-btn-active-Tenant-Support" : ""}`}
                            onClick={() => setActiveFilter("pending")}
                        >
                            Pending
                        </button>
                        <button 
                            className={`filter-btn-Tenant-Support ${activeFilter === "completed" ? "filter-btn-active-Tenant-Support" : ""}`}
                            onClick={() => setActiveFilter("completed")}
                        >
                            Resolved
                        </button>
                    </div>
                    
                    {/* New Concern Button */}
                    <button className="new-concern-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>
                        <span className="btn-icon-Tenant-Support">+</span>
                        New Concern
                    </button>
                </div>
            </div>

            {/* Concerns List / Cards */}
            <div className="concerns-list-Tenant-Support">
                {filteredConcerns.length > 0 ? (
                    filteredConcerns.map(concern => (
                        <div key={concern.id} className="concern-card-Tenant-Support">
                            <div className="card-header-Tenant-Support">
                                <div className="category-badge-Tenant-Support">
                                    <span className="category-icon-Tenant-Support">{getCategoryIcon(concern.category)}</span>
                                    {concern.category}
                                </div>
                                <span className={`concern-status-Tenant-Support status-${concern.status.toLowerCase()}-Tenant-Support`}>
                                    <span className="status-icon-Tenant-Support">{getStatusIcon(concern.status)}</span>
                                    {concern.status}
                                </span>
                            </div>
                            
                            <div className="concern-content-Tenant-Support">
                                <h4 className="concern-title-Tenant-Support">{concern.title}</h4>
                                <p className="concern-description-Tenant-Support">
                                    Concern regarding {concern.category.toLowerCase()} issue that requires attention.
                                </p>
                            </div>
                            
                            <div className="card-footer-Tenant-Support">
                                <div className="concern-meta-Tenant-Support">
                                    <div className="meta-item-Tenant-Support">
                                        <span className="meta-label-Tenant-Support">Concern ID</span>
                                        <span className="meta-value-Tenant-Support">{concern.id}</span>
                                    </div>
                                    <div className="meta-item-Tenant-Support">
                                        <span className="meta-label-Tenant-Support">Date Reported</span>
                                        <span className="meta-value-Tenant-Support date-value-Tenant-Support">
                                            <span className="date-icon-Tenant-Support">📅</span>
                                            {concern.date}
                                        </span>
                                    </div>
                                </div>
                                <button className="view-details-btn-Tenant-Support">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-concerns-Tenant-Support">
                        <div className="no-concerns-icon-Tenant-Support">📝</div>
                        <h3 className="no-concerns-title-Tenant-Support">No concerns found</h3>
                        <p className="no-concerns-description-Tenant-Support">
                            {searchTerm ? "No concerns match your search criteria." : "You haven't reported any concerns yet."}
                        </p>
                        {!searchTerm && (
                            <button className="no-concerns-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>
                                Report Your First Concern
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ===== NEW CONCERN MODAL ===== */}
            {isNewConcernModalOpen && (
                <div className="modal-overlay-Tenant-Support" onClick={handleCloseNewConcernModal}>
                    <div className="concern-modal-Tenant-Support" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header-Tenant-Support">
                            <button className="back-btn-Tenant-Support" onClick={handleCloseNewConcernModal}>
                                <span className="back-icon-Tenant-Support">←</span>
                                Back
                            </button>
                            <h3 className="modal-title-Tenant-Support">Create New Concern 🆕</h3>
                            <div className="modal-header-spacer-Tenant-Support"></div>
                        </div>

                        <div className="modal-content-Tenant-Support">
                            <form className="concern-form-Tenant-Support">
                                
                                {/* Concern Type Dropdown */}
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concern-type" className="form-label-Tenant-Support">
                                        <span className="label-icon-Tenant-Support">📋</span>
                                        Concern Type *
                                    </label>
                                    <select id="concern-type" className="form-input-Tenant-Support" required>
                                        <option value="">Select Category</option>
                                        <option value="Maintenance">🔧 Maintenance</option>
                                        <option value="Billing">💰 Billing</option>
                                        <option value="Contract">📝 Contract</option>
                                        <option value="Other">❓ Other</option>
                                    </select>
                                </div>
                                
                                {/* Subject/Title */}
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concern-title" className="form-label-Tenant-Support">
                                        <span className="label-icon-Tenant-Support">💬</span>
                                        Subject / Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        id="concern-title" 
                                        className="form-input-Tenant-Support" 
                                        placeholder="e.g., Water Leakage in Unit 1" 
                                        required 
                                    />
                                </div>
                                
                                {/* Description */}
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concern-description" className="form-label-Tenant-Support">
                                        <span className="label-icon-Tenant-Support">📝</span>
                                        Details / Description *
                                    </label>
                                    <textarea 
                                        id="concern-description" 
                                        className="form-input-Tenant-Support textarea-Tenant-Support" 
                                        rows="4" 
                                        placeholder="Please provide detailed information about your concern, including location, severity, and any other relevant details..." 
                                        required
                                    ></textarea>
                                </div>
                                
                                {/* Upload Attachment */}
                                <div className="form-group-Tenant-Support">
                                    <label className="form-label-Tenant-Support">
                                        <span className="label-icon-Tenant-Support">📎</span>
                                        Attachment (Optional)
                                    </label>
                                    <div className="upload-container-Tenant-Support">
                                        <div className="upload-box-Tenant-Support">
                                            <div className="upload-icon-Tenant-Support">📁</div>
                                            <div className="upload-text-Tenant-Support">
                                                <p className="upload-title-Tenant-Support">Upload supporting documents</p>
                                                <p className="upload-subtitle-Tenant-Support">Supports JPG, PNG, PDF up to 10MB</p>
                                            </div>
                                            <label className="upload-btn-Tenant-Support">
                                                Choose File
                                                <input type="file" className="file-input-Tenant-Support" multiple />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                            </form>
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
                                >
                                    <span className="submit-icon-Tenant-Support">🚀</span>
                                    Submit Concern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;