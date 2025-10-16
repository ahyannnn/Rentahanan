import React, { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import "../../styles/owners/Billing.css";

function Billing() {

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    return (
        <div className="billing-page-container">
            {/* Header */}
            <div className="content-card header-card">
                <h2>Billing & Invoicing</h2>
                <p>Generate and manage monthly bills, send invoices, and track payments.</p>
            </div>

            {/* Invoice Area */}
            <div className="content-card invoice-area">
                <div className="invoice-control-bar">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Search Invoice No., Name, or Status" />
                    </div>

                    <button
                        className="create-invoice-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={18} />
                        Create Invoice
                    </button>
                </div>

                {/* Static Table */}
                <div className="invoice-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice No.</th>
                                <th>Name</th>
                                <th>Issued Date</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>202501</td>
                                <td>Juan Dela Cruz</td>
                                <td>2025-10-01</td>
                                <td>2025-10-15</td>
                                <td>₱1,500</td>
                                <td><span className="status-badge status-unpaid">Unpaid</span></td>
                                <td>
                                    <button
                                        className="action-btn view-btn"
                                        onClick={() => setShowViewModal(true)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>202502</td>
                                <td>Maria Santos</td>
                                <td>2025-10-01</td>
                                <td>2025-10-15</td>
                                <td>₱3,000</td>
                                <td><span className="status-badge status-paid">Paid</span></td>
                                <td>
                                    <button
                                        className="action-btn view-btn"
                                        onClick={() => setShowViewModal(true)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>202503</td>
                                <td>Pedro Cruz</td>
                                <td>2025-09-01</td>
                                <td>2025-09-15</td>
                                <td>₱18,500</td>
                                <td><span className="status-badge status-unpaid">Unpaid</span></td>
                                <td>
                                    <button
                                        className="action-btn view-btn"
                                        onClick={() => setShowViewModal(true)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Invoice Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="add-invoice-modal">
                        <div className="modal-header">
                            <h3>Create New Invoice</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <label>Tenant Name</label>
                            <input type="text" placeholder="e.g. Juan Dela Cruz" />

                            <label>Invoice No.</label>
                            <input type="text" placeholder="e.g. 202505" />

                            <label>Issued Date</label>
                            <input type="date" />

                            <label>Due Date</label>
                            <input type="date" />

                            <label>Amount (₱)</label>
                            <input type="number" placeholder="e.g. 15000" />

                            <label>Status</label>
                            <select>
                                <option>Unpaid</option>
                                <option>Paid</option>
                            </select>

                            <label>Bill Description</label>
                            <textarea placeholder="e.g. Monthly Rent for October 2025"></textarea>
                        </div>

                        <div className="modal-footer">
                            <button className="save-btn">Save</button>
                            <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Invoice Modal */}
            {showViewModal && (
                <div className="modal-overlay">
                    <div className="view-invoice-modal">
                        <div className="modal-header">
                            <h3>Invoice Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p><strong>Invoice No:</strong> 202501</p>
                            <p><strong>Tenant Name:</strong> Juan Dela Cruz</p>
                            <p><strong>Issued Date:</strong> 2025-10-01</p>
                            <p><strong>Due Date:</strong> 2025-10-15</p>
                            <p><strong>Amount:</strong> ₱1,500</p>
                            <p><strong>Status:</strong> <span className="status-badge status-unpaid">Unpaid</span></p>
                            <p><strong>Description:</strong> Monthly Rent for October 2025</p>
                        </div>

                        <div className="modal-footer">
                            <button className="close-btn-2" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;
