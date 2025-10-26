import React, { useState } from "react";
import "../../styles/tenant/Support.css";

const Support = () => {
    // State para sa modal visibility
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
        <div className="support-container">
            
            {/* Page Header */}
            <div className="page-header">
                <h2>Support & Concerns</h2>
                <p>Track the status of your reported issues and create new concerns.</p>
            </div>

            {/* Controls */}
            <div className="support-top-controls">
                <input type="text" placeholder="Search Concern ID or Title..." className="search-input" />
                
                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button 
                        className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        All
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === "pending" ? "active" : ""}`}
                        onClick={() => setActiveFilter("pending")}
                    >
                        Pending
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === "completed" ? "active" : ""}`}
                        onClick={() => setActiveFilter("completed")}
                    >
                        Completed
                    </button>
                </div>
                
                {/* Button na magpapakita ng modal */}
                <button className="new-concern-btn" onClick={handleOpenNewConcernModal}>+ New Concern</button>
            </div>

            {/* Concerns List / Cards */}
            <div className="concerns-list">
                {filteredConcerns.map(concern => (
                    <div key={concern.id} className="concern-card">
                        <div className="card-top">
                            <span className="concern-category">{concern.category}</span>
                            <span className={`concern-status status-${concern.status.toLowerCase()}`}>{concern.status}</span>
                        </div>
                        <h4 className="concern-title">{concern.title}</h4>
                        <div className="card-bottom">
                            <div className="concern-info">
                                <span className="info-label">Concern ID</span>
                                <span className="info-value">{concern.id}</span>
                            </div>
                            <div className="concern-info">
                                <span className="info-label">Date</span>
                                <span className="info-value date-value">📅 {concern.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== NEW CONCERN MODAL (Floating Center) ===== */}
            {isNewConcernModalOpen && (
                <div className="modal-overlay" onClick={handleCloseNewConcernModal}>
                    <div className="concern-modal" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <button className="back-btn" onClick={handleCloseNewConcernModal}>&lt;</button>
                            <h3>Create New Concern</h3>
                        </div>

                        <div className="modal-content">
                            <form className="concern-form">
                                
                                {/* Concern Type Dropdown */}
                                <div className="form-group">
                                    <label htmlFor="concern-type">Concern Type *</label>
                                    <select id="concern-type" className="form-input" required>
                                        <option value="">Select Category</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="billing">Billing</option>
                                        <option value="contract">Contract</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                {/* Subject/Title */}
                                <div className="form-group">
                                    <label htmlFor="concern-title">Subject / Title *</label>
                                    <input type="text" id="concern-title" className="form-input" placeholder="e.g., Water Leakage in Unit 1" required />
                                </div>
                                
                                {/* Description */}
                                <div className="form-group">
                                    <label htmlFor="concern-description">Details / Description *</label>
                                    <textarea id="concern-description" className="form-input textarea" rows="4" placeholder="Please provide detailed information about your concern..." required></textarea>
                                </div>
                                
                                {/* Upload Attachment (Optional) */}
                                <div className="form-group">
                                    <label>Attachment (Image/PDF)</label>
                                    <div className="upload-proof">
                                        <span className="file-info">No file chosen</span>
                                        <label className="choose-file-btn">
                                            Choose File
                                            <input type="file" style={{display: 'none'}} />
                                        </label>
                                    </div>
                                </div>
                                
                            </form>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="submit-btn" type="submit">Submit Concern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;