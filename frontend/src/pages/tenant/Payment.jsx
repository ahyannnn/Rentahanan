import React, { useState, useEffect } from "react";
import { 
  Search, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Smartphone,
  Banknote,
  Building,
  Download
} from "lucide-react";
import "../../styles/tenant/Payment.css";

const Payment = () => {
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [timeFilter, setTimeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const itemsPerPage = 6;
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const tenantId = storedUser.tenantid || storedUser.userid || null;

    useEffect(() => {
        fetchPaidBills();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [paymentHistory, timeFilter, currentPage, searchTerm]);

    const fetchPaidBills = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/bills/paid/${tenantId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch payment history: ${response.status}`);
            }
            
            const data = await response.json();
            setPaymentHistory(data);
        } catch (err) {
            console.error("Error fetching paid bills:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...paymentHistory];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.billType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.paymentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.gcashRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.amount?.toString().includes(searchTerm)
            );
        }

        // Apply time filter
        if (timeFilter !== "all") {
            const now = new Date();
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.date);
                
                switch (timeFilter) {
                    case "week":
                        const oneWeekAgo = new Date(now);
                        oneWeekAgo.setDate(now.getDate() - 7);
                        return paymentDate >= oneWeekAgo;
                    
                    case "month":
                        const oneMonthAgo = new Date(now);
                        oneMonthAgo.setMonth(now.getMonth() - 1);
                        return paymentDate >= oneMonthAgo;
                    
                    case "year":
                        const oneYearAgo = new Date(now);
                        oneYearAgo.setFullYear(now.getFullYear() - 1);
                        return paymentDate >= oneYearAgo;
                    
                    default:
                        return true;
                }
            });
        }

        setFilteredPayments(filtered);
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredPayments.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleTimeFilterChange = (filter) => {
        setTimeFilter(filter);
        setCurrentPage(1);
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "paid": return <CheckCircle size={16} className="status-icon-tenant-p" />;
            case "pending": return <Clock size={16} className="status-icon-tenant-p" />;
            case "cancelled": return <XCircle size={16} className="status-icon-tenant-p" />;
            default: return <FileText size={16} className="status-icon-tenant-p" />;
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method?.toLowerCase()) {
            case "gcash": return <Smartphone size={16} className="payment-method-icon-tenant-p" />;
            case "cash": return <Banknote size={16} className="payment-method-icon-tenant-p" />;
            case "bank transfer": return <Building size={16} className="payment-method-icon-tenant-p" />;
            case "credit card": return <CreditCard size={16} className="payment-method-icon-tenant-p" />;
            default: return <CreditCard size={16} className="payment-method-icon-tenant-p" />;
        }
    };

    if (loading) {  
        return (
            <div className="payment-history-container-tenant-p">
                <div className="loading-container-tenant-p">
                    <div className="loading-spinner-tenant-p"></div>
                    <p className="loading-text-tenant-p">Loading payment history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-history-container-tenant-p">
                <div className="error-container-tenant-p">
                    <div className="error-icon-tenant-p">⚠️</div>
                    <h3 className="error-title-tenant-p">Error Loading Payment History</h3>
                    <p className="error-message-tenant-p">{error}</p>
                    <button onClick={fetchPaidBills} className="retry-btn-tenant-p">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const currentItems = getCurrentPageItems();

    return (
        <div className="payment-history-container-tenant-p">
            {/* Header Section */}
            <div className="page-header-section-tenant-p">
                <h2 className="page-header-tenant-p">Payment History</h2>
                <p className="page-subtext-tenant-p">View all your past successful payment records</p>
            </div>

            {/* Controls Section */}
            <div className="controls-container-tenant-p">
                <div className="search-container-tenant-p">
                    <div className="search-box-tenant-p">
                        <Search size={18} className="search-icon-tenant-p" />
                        <input
                            type="text"
                            placeholder="Search by bill type, status, or reference..."
                            className="search-input-tenant-p"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="time-filters-container-tenant-p">
                    <div className="time-filters-tenant-p">
                        <button
                            className={`time-filter-btn-tenant-p ${timeFilter === "all" ? "time-filter-btn-active-tenant-p" : ""}`}
                            onClick={() => handleTimeFilterChange("all")}
                        >
                            All Time
                        </button>
                        <button
                            className={`time-filter-btn-tenant-p ${timeFilter === "week" ? "time-filter-btn-active-tenant-p" : ""}`}
                            onClick={() => handleTimeFilterChange("week")}
                        >
                            This Week
                        </button>
                        <button
                            className={`time-filter-btn-tenant-p ${timeFilter === "month" ? "time-filter-btn-active-tenant-p" : ""}`}
                            onClick={() => handleTimeFilterChange("month")}
                        >
                            This Month
                        </button>
                        <button
                            className={`time-filter-btn-tenant-p ${timeFilter === "year" ? "time-filter-btn-active-tenant-p" : ""}`}
                            onClick={() => handleTimeFilterChange("year")}
                        >
                            This Year
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Cards - 1 per row */}
            <div className="payments-list-container-tenant-p">
                <div className="payments-list-tenant-p">
                    {currentItems.length > 0 ? (
                        currentItems.map((payment) => (
                            <div key={payment.id} className="payment-card-tenant-p">
                                <div className="payment-card-header-tenant-p">
                                    <div className="payment-type-badge-tenant-p">
                                        <FileText size={16} className="payment-type-icon-tenant-p" />
                                        <span className="payment-type-text-tenant-p">{payment.billType || "Bill Payment"}</span>
                                    </div>
                                    <span className={`payment-status-tenant-p payment-status-${payment.status?.toLowerCase()}-tenant-p`}>
                                        {getStatusIcon(payment.status)}
                                        <span className="status-text-tenant-p">{payment.status}</span>
                                    </span>
                                </div>

                                <div className="payment-card-content-tenant-p">
                                    <div className="payment-main-info-tenant-p">
                                        <h3 className="payment-amount-tenant-p">
                                            ₱{payment.amount?.toLocaleString() || '0.00'}
                                        </h3>
                                        <p className="payment-description-tenant-p">
                                            {payment.description || `Payment for ${payment.billType}`}
                                        </p>
                                    </div>

                                    <div className="payment-details-grid-tenant-p">
                                        <div className="detail-item-tenant-p">
                                            <div className="detail-label-container-tenant-p">
                                                <Calendar size={14} className="detail-icon-tenant-p" />
                                                <span className="detail-label-tenant-p">Payment Date</span>
                                            </div>
                                            <span className="detail-value-tenant-p">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="detail-item-tenant-p">
                                            <div className="detail-label-container-tenant-p">
                                                {getPaymentMethodIcon(payment.paymentType)}
                                                <span className="detail-label-tenant-p">Payment Method</span>
                                            </div>
                                            <span className="detail-value-tenant-p">
                                                {payment.paymentType}
                                            </span>
                                        </div>
                                        {payment.gcashRef && (
                                            <div className="detail-item-tenant-p">
                                                <div className="detail-label-container-tenant-p">
                                                    <FileText size={14} className="detail-icon-tenant-p" />
                                                    <span className="detail-label-tenant-p">Reference No.</span>
                                                </div>
                                                <span className="detail-value-tenant-p ref-value-tenant-p">
                                                    #{payment.gcashRef}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="payment-card-footer-tenant-p">
                                    <div className="payment-id-tenant-p">
                                        <span className="id-label-tenant-p">Payment ID:</span>
                                        <span className="id-value-tenant-p">#{payment.id}</span>
                                    </div>
                                    <div className="payment-actions-tenant-p">
                                        <button className="view-receipt-btn-tenant-p">
                                            <Download size={16} className="receipt-icon-tenant-p" />
                                            <span className="receipt-text-tenant-p">View Receipt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-payments-tenant-p">
                            <div className="no-payments-icon-tenant-p">💸</div>
                            <h3 className="no-payments-title-tenant-p">No payments found</h3>
                            <p className="no-payments-description-tenant-p">
                                {searchTerm || timeFilter !== "all" 
                                    ? "No payments match your search criteria." 
                                    : "You haven't made any payments yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {filteredPayments.length > itemsPerPage && (
                <div className="pagination-container-tenant-p">
                    <div className="pagination-controls-tenant-p">
                        <button 
                            className="pagination-btn-tenant-p" 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            ← Previous
                        </button>
                        
                        <span className="pagination-info-tenant-p">
                            Page {currentPage} of {totalPages}
                        </span>
                        
                        <button 
                            className="pagination-btn-tenant-p" 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Results Count */}
            <div className="results-count-tenant-p">
                <p className="results-text-tenant-p">
                    Showing {currentItems.length} of {filteredPayments.length} payments
                    {(searchTerm || timeFilter !== "all") && " (filtered)"}
                </p>
            </div>
        </div>
    );
};

export default Payment;