import React, { useState, useEffect } from "react";
import "../../styles/tenant/Payment.css";

const Payment = () => {
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [timeFilter, setTimeFilter] = useState("all"); // "all", "week", "month", "year"
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const itemsPerPage = 10;
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const tenantId = storedUser.tenantid || storedUser.userid || null;

    useEffect(() => {
        fetchPaidBills();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [paymentHistory, timeFilter, currentPage]);

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
        setCurrentPage(1); // Reset to first page when filter changes
    };

    if (loading) {  
        return (
            <div className="bills-invoice-container payment-history-container">
                <div className="loading-message">
                    <p>Loading payment history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bills-invoice-container payment-history-container">
                <div className="error-message">
                    <p>Error: {error}</p>
                    <button onClick={fetchPaidBills} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const currentItems = getCurrentPageItems();

    return (
        <div className="bills-invoice-container payment-history-container">
            <div className="page-header">
                <h2>Payment History</h2>
                <p>View all your past successful payment records.</p>
            </div>

            <div className="top-controls">
                <input 
                    type="text" 
                    placeholder="🔍 Search payment record..." 
                    className="search-input" 
                />
                
                <div className="time-filter-tabs">
                    <button 
                        className={`time-filter-btn ${timeFilter === "all" ? "active" : ""}`}
                        onClick={() => handleTimeFilterChange("all")}
                    >
                        All Time
                    </button>
                    <button 
                        className={`time-filter-btn ${timeFilter === "week" ? "active" : ""}`}
                        onClick={() => handleTimeFilterChange("week")}
                    >
                        This Week
                    </button>
                    <button 
                        className={`time-filter-btn ${timeFilter === "month" ? "active" : ""}`}
                        onClick={() => handleTimeFilterChange("month")}
                    >
                        This Month
                    </button>
                    <button 
                        className={`time-filter-btn ${timeFilter === "year" ? "active" : ""}`}
                        onClick={() => handleTimeFilterChange("year")}
                    >
                        This Year
                    </button>
                </div>
            </div>

            <div className="payment-cards-grid">
                {currentItems.length > 0 ? (
                    currentItems.map(payment => (
                        <div key={payment.id} className="payment-card">
                            <div className="card-header">
                                <span className="card-bill-type">Bills - {payment.billType?.toUpperCase()}</span>
                                <span className={`card-status status-${payment.status?.toLowerCase().replace(' ', '-')}`}>
                                    {payment.status}
                                </span>
                                <span className="arrow-icon">&gt;</span>
                            </div>
                            <div className="card-details">
                                <div className="detail-item">
                                    <span className="detail-label">Payment Date</span>
                                    <span className="detail-value date-icon">📅 {payment.date}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Amount:</span>
                                    <span className="detail-value amount-text">{payment.amount}</span>
                                </div>
                                {payment.paymentType && (
                                    <div className="detail-item">
                                        <span className="detail-label">Payment Method:</span>
                                        <span className="detail-value">{payment.paymentType}</span>
                                    </div>
                                )}
                                {payment.gcashRef && (
                                    <div className="detail-item">
                                        <span className="detail-label">GCash Reference:</span>
                                        <span className="detail-value">{payment.gcashRef}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-payments-message">
                        <p>No payment records found for the selected period.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredPayments.length > itemsPerPage && (
                <div className="pagination-controls">
                    <button 
                        className="pagination-btn" 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button 
                        className="pagination-btn" 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Results Count */}
            <div className="results-count">
                Showing {currentItems.length} of {filteredPayments.length} payments
                {timeFilter !== "all" && ` (${timeFilter} filter applied)`}
            </div>
        </div>
    );
};

export default Payment;