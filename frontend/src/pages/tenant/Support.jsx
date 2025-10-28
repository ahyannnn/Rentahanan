import React, { useState } from "react";
import "../../styles/tenant/Support.css";

const Support = () => {
    const [isNewConcernModalOpen, setIsNewConcernModalOpen] = useState(false); 
    const [activeFilter, setActiveFilter] = useState("all");
    
    const concerns = [
        { id: 'C-2025-001', category: "Maintenance", title: "Water leakage in the unit", date: "01-01-0001", status: "Pending" },
        { id: 'C-2025-002', category: "Billing", title: "mahal naman bayad", date: "01-01-0001", status: "Pending" },
        { id: 'C-2025-003', category: "Contract", title: "why why why carlot", date: "01-01-0001", status: "Pending" },
        { id: 'C-2025-004', category: "Other", title: "secret to more on wala sa tatlo", date: "01-01-0001", status: "Resolved" },
    ];

    const handleOpenNewConcernModal = () => setIsNewConcernModalOpen(true);
    const handleCloseNewConcernModal = () => setIsNewConcernModalOpen(false);

    const filteredConcerns = concerns.filter(concern => {
        if (activeFilter === "all") return true;
        if (activeFilter === "pending") return concern.status === "Pending";
        if (activeFilter === "completed") return concern.status === "Resolved";
        return true;
    });

    return (
        <div className="support-container-Tenant-Support">
            
            {/* Page Header */}
            <div className="page-header-Tenant-Support">
                <h2 className="page-title-Tenant-Support">Support & Concerns</h2>
                <p className="page-description-Tenant-Support">Track the status of your reported issues and create new concerns.</p>
            </div>

            {/* Controls */}
            <div className="support-top-controls-Tenant-Support">
                <input 
                    type="text" 
                    placeholder="Search Concern ID or Title..." 
                    className="search-input-Tenant-Support" 
                />
                
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
                        Completed
                    </button>
                </div>
                
                {/* New Concern Button */}
                <button className="new-concern-btn-Tenant-Support" onClick={handleOpenNewConcernModal}>+ New Concern</button>
            </div>

            {/* Concerns List / Cards */}
            <div className="concerns-list-Tenant-Support">
                {filteredConcerns.map(concern => (
                    <div key={concern.id} className="concern-card-Tenant-Support">
                        <div className="card-top-Tenant-Support">
                            <span className="concern-category-Tenant-Support">{concern.category}</span>
                            <span className={`concern-status-Tenant-Support status-${concern.status.toLowerCase()}-Tenant-Support`}>
                                {concern.status}
                            </span>
                        </div>
                        <h4 className="concern-title-Tenant-Support">{concern.title}</h4>
                        <div className="card-bottom-Tenant-Support">
                            <div className="concern-info-Tenant-Support">
                                <span className="info-label-Tenant-Support">Concern ID</span>
                                <span className="info-value-Tenant-Support">{concern.id}</span>
                            </div>
                            <div className="concern-info-Tenant-Support">
                                <span className="info-label-Tenant-Support">Date</span>
                                <span className="info-value-Tenant-Support date-value-Tenant-Support">📅 {concern.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== NEW CONCERN MODAL ===== */}
            {isNewConcernModalOpen && (
                <div className="modal-overlay-Tenant-Support" onClick={handleCloseNewConcernModal}>
                    <div className="concern-modal-Tenant-Support" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header-Tenant-Support">
                            <button className="back-btn-Tenant-Support" onClick={handleCloseNewConcernModal}>&lt;</button>
                            <h3 className="modal-title-Tenant-Support">Create New Concern</h3>
                        </div>

                        <div className="modal-content-Tenant-Support">
                            <form className="concern-form-Tenant-Support">
                                
                                {/* Concern Type Dropdown */}
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concern-type" className="form-label-Tenant-Support">Concern Type *</label>
                                    <select id="concern-type" className="form-input-Tenant-Support" required>
                                        <option value="">Select Category</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="billing">Billing</option>
                                        <option value="contract">Contract</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                {/* Subject/Title */}
                                <div className="form-group-Tenant-Support">
                                    <label htmlFor="concern-title" className="form-label-Tenant-Support">Subject / Title *</label>
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
                                    <label htmlFor="concern-description" className="form-label-Tenant-Support">Details / Description *</label>
                                    <textarea 
                                        id="concern-description" 
                                        className="form-input-Tenant-Support textarea-Tenant-Support" 
                                        rows="4" 
                                        placeholder="Please provide detailed information about your concern..." 
                                        required
                                    ></textarea>
                                </div>
                                
                                {/* Upload Attachment */}
                                <div className="form-group-Tenant-Support">
                                    <label className="form-label-Tenant-Support">Attachment (Image/PDF)</label>
                                    <div className="upload-proof-Tenant-Support">
                                        <span className="file-info-Tenant-Support">No file chosen</span>
                                        <label className="choose-file-btn-Tenant-Support">
                                            Choose File
                                            <input type="file" className="file-input-Tenant-Support" />
                                        </label>
                                    </div>
                                </div>
                                
                            </form>
                        </div>
                        
                        <div className="modal-footer-Tenant-Support">
                            <button className="submit-btn-Tenant-Support" type="submit">Submit Concern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;