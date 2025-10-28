import React, { useState } from "react";
import {
  Users,
  Home,
  FileWarning,
  Wallet,
  TrendingUp,
  Calendar,
  Download,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import "../../styles/owners/Dashboard.css";

const Dashboard = () => {
  const [pendingApplications, setPendingApplications] = useState([
    { id: 1, name: "Juan Dela Cruz 1", unit: "House 1", applied: "2024-01-11", status: "PENDING" },
    { id: 2, name: "Juan Dela Cruz 2", unit: "House 2", applied: "2024-01-12", status: "PENDING" },
    { id: 3, name: "Juan Dela Cruz 3", unit: "House 3", applied: "2024-01-13", status: "PENDING" },
    { id: 4, name: "Juan Dela Cruz 4", unit: "House 4", applied: "2024-01-14", status: "PENDING" }
  ]);

  const [recentInvoices, setRecentInvoices] = useState([
    { id: 1, tenant: "Maria Santos 1", dueDate: "2024-01-16", amount: "₱15,500", status: "PAID", invoiceNo: "INV-2024-001" },
    { id: 2, tenant: "Maria Santos 2", dueDate: "2024-01-17", amount: "₱16,000", status: "OVERDUE", invoiceNo: "INV-2024-002" },
    { id: 3, tenant: "Maria Santos 3", dueDate: "2024-01-18", amount: "₱16,500", status: "PAID", invoiceNo: "INV-2024-003" },
    { id: 4, tenant: "Maria Santos 4", dueDate: "2024-01-19", amount: "₱17,000", status: "PAID", invoiceNo: "INV-2024-004" }
  ]);

  const [pendingSearch, setPendingSearch] = useState("");
  const [invoicesSearch, setInvoicesSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredPendingApplications = pendingApplications.filter(app =>
    app.name.toLowerCase().includes(pendingSearch.toLowerCase()) ||
    app.unit.toLowerCase().includes(pendingSearch.toLowerCase()) ||
    app.applied.includes(pendingSearch)
  );

  const filteredRecentInvoices = recentInvoices.filter(invoice =>
    invoice.tenant.toLowerCase().includes(invoicesSearch.toLowerCase()) ||
    invoice.invoiceNo.toLowerCase().includes(invoicesSearch.toLowerCase()) ||
    invoice.amount.includes(invoicesSearch) ||
    invoice.status.toLowerCase().includes(invoicesSearch.toLowerCase())
  );

  return (
    <div className="dashboard-container-Owner-Dashboard">
      {/* ==== HEADER SECTION ==== */}
      <div className="dashboard-header-Owner-Dashboard">
        <div className="header-content-Owner-Dashboard">
          <h1 className="dashboard-title-Owner-Dashboard">Dashboard Overview</h1>
          <p className="dashboard-subtitle-Owner-Dashboard">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-actions-Owner-Dashboard">
          <button className="date-filter-btn-Owner-Dashboard">
            <Calendar className="btn-icon-Owner-Dashboard" size={18} />
            <span className="btn-text-Owner-Dashboard">This Month</span>
          </button>
          <button className="export-btn-Owner-Dashboard">
            <Download className="btn-icon-Owner-Dashboard" size={18} />
            <span className="btn-text-Owner-Dashboard">Export</span>
          </button>
        </div>
      </div>

      {/* ==== STATS CARDS ==== */}
      <div className="stats-grid-Owner-Dashboard">
        <div className="stat-card-Owner-Dashboard">
          <div className="stat-icon-container-Owner-Dashboard stat-icon-blue-Owner-Dashboard">
            <Users className="stat-icon-Owner-Dashboard" size={28} />
          </div>
          <div className="stat-info-Owner-Dashboard">
            <p className="stat-label-Owner-Dashboard">Total Tenants</p>
            <h2 className="stat-value-Owner-Dashboard">24</h2>
            <div className="stat-trend-Owner-Dashboard stat-trend-up-Owner-Dashboard">
              <TrendingUp className="trend-icon-Owner-Dashboard" size={16} />
              <span className="trend-text-Owner-Dashboard">+12% this month</span>
            </div>
          </div>
        </div>

        <div className="stat-card-Owner-Dashboard">
          <div className="stat-icon-container-Owner-Dashboard stat-icon-green-Owner-Dashboard">
            <Home className="stat-icon-Owner-Dashboard" size={28} />
          </div>
          <div className="stat-info-Owner-Dashboard">
            <p className="stat-label-Owner-Dashboard">Vacant Units</p>
            <h2 className="stat-value-Owner-Dashboard">3</h2>
            <div className="stat-trend-Owner-Dashboard stat-trend-down-Owner-Dashboard">
              <span className="trend-text-Owner-Dashboard">-2 from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card-Owner-Dashboard">
          <div className="stat-icon-container-Owner-Dashboard stat-icon-orange-Owner-Dashboard">
            <FileWarning className="stat-icon-Owner-Dashboard" size={28} />
          </div>
          <div className="stat-info-Owner-Dashboard">
            <p className="stat-label-Owner-Dashboard">Pending Bills</p>
            <h2 className="stat-value-Owner-Dashboard">5</h2>
            <div className="stat-trend-Owner-Dashboard stat-trend-up-Owner-Dashboard">
              <span className="trend-text-Owner-Dashboard">+3 overdue</span>
            </div>
          </div>
        </div>

        <div className="stat-card-Owner-Dashboard">
          <div className="stat-icon-container-Owner-Dashboard stat-icon-gold-Owner-Dashboard">
            <Wallet className="stat-icon-Owner-Dashboard" size={28} />
          </div>
          <div className="stat-info-Owner-Dashboard">
            <p className="stat-label-Owner-Dashboard">Monthly Income</p>
            <h2 className="stat-value-Owner-Dashboard">₱85,500</h2>
            <div className="stat-trend-Owner-Dashboard stat-trend-up-Owner-Dashboard">
              <TrendingUp className="trend-icon-Owner-Dashboard" size={16} />
              <span className="trend-text-Owner-Dashboard">+8% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==== TABLE SECTIONS ==== */}
      <div className="tables-grid-Owner-Dashboard">
        {/* Pending Applications Table */}
        <div className="table-card-Owner-Dashboard">
          <div className="table-header-Owner-Dashboard">
            <h3 className="table-title-Owner-Dashboard">PENDING APPLICATIONS</h3>
          </div>
          
          {/* Search Box */}
          <div className="search-container-Owner-Dashboard">
            <div className="search-box-Owner-Dashboard">
              <Search className="search-icon-Owner-Dashboard" size={18} />
              <input
                type="text"
                placeholder="Search applications..."
                className="search-input-Owner-Dashboard"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
              />
            </div>
            <button className="filter-btn-Owner-Dashboard">
              <Filter className="filter-icon-Owner-Dashboard" size={18} />
            </button>
          </div>

          <div className="table-container-Owner-Dashboard">
            <table className="data-table-Owner-Dashboard">
              <thead className="table-head-Owner-Dashboard">
                <tr className="table-row-Owner-Dashboard">
                  <th 
                    className="table-header-Owner-Dashboard table-col-name-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('name')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      NAME
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                  <th 
                    className="table-header-Owner-Dashboard table-col-unit-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      UNIT
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'unit' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'unit' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                  <th 
                    className="table-header-Owner-Dashboard table-col-date-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('applied')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      APPLIED
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'applied' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'applied' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                  <th className="table-header-Owner-Dashboard table-col-status-Owner-Dashboard">
                    STATUS
                  </th>
                  <th className="table-header-Owner-Dashboard table-col-action-Owner-Dashboard">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="table-body-Owner-Dashboard">
                {filteredPendingApplications.map((application) => (
                  <tr className="table-row-Owner-Dashboard" key={application.id}>
                    <td className="table-data-Owner-Dashboard table-col-name-Owner-Dashboard" data-label="NAME">
                      <span className="data-text-Owner-Dashboard">{application.name}</span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-unit-Owner-Dashboard" data-label="UNIT">
                      <span className="data-text-Owner-Dashboard">{application.unit}</span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-date-Owner-Dashboard" data-label="APPLIED">
                      <span className="data-text-Owner-Dashboard">{application.applied}</span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-status-Owner-Dashboard" data-label="STATUS">
                      <span className="status-badge-Owner-Dashboard status-pending-Owner-Dashboard">
                        {application.status}
                      </span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-action-Owner-Dashboard" data-label="ACTION">
                      <button className="view-btn-Owner-Dashboard">
                        <Eye className="view-icon-Owner-Dashboard" size={16} />
                        <span className="view-text-Owner-Dashboard">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="table-card-Owner-Dashboard">
          <div className="table-header-Owner-Dashboard">
            <h3 className="table-title-Owner-Dashboard">RECENT INVOICES</h3>
          </div>
          
          {/* Search Box */}
          <div className="search-container-Owner-Dashboard">
            <div className="search-box-Owner-Dashboard">
              <Search className="search-icon-Owner-Dashboard" size={18} />
              <input
                type="text"
                placeholder="Search invoices..."
                className="search-input-Owner-Dashboard"
                value={invoicesSearch}
                onChange={(e) => setInvoicesSearch(e.target.value)}
              />
            </div>
            <button className="filter-btn-Owner-Dashboard">
              <Filter className="filter-icon-Owner-Dashboard" size={18} />
            </button>
          </div>

          <div className="table-container-Owner-Dashboard">
            <table className="data-table-Owner-Dashboard">
              <thead className="table-head-Owner-Dashboard">
                <tr className="table-row-Owner-Dashboard">
                  <th 
                    className="table-header-Owner-Dashboard table-col-name-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('tenant')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      TENANT
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'tenant' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'tenant' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                  <th 
                    className="table-header-Owner-Dashboard table-col-date-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      DUE DATE
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'dueDate' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'dueDate' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                  <th 
                    className="table-header-Owner-Dashboard table-col-amount-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      AMOUNT
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'amount' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'amount' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                  <th className="table-header-Owner-Dashboard table-col-status-Owner-Dashboard">
                    STATUS
                  </th>
                  <th 
                    className="table-header-Owner-Dashboard table-col-invoice-Owner-Dashboard sortable-header-Owner-Dashboard"
                    onClick={() => handleSort('invoiceNo')}
                  >
                    <div className="header-content-Owner-Dashboard">
                      INVOICE NO.
                      <div className="sort-icons-Owner-Dashboard">
                        <ChevronUp className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'invoiceNo' && sortConfig.direction === 'asc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                        <ChevronDown className={`sort-icon-Owner-Dashboard ${sortConfig.key === 'invoiceNo' && sortConfig.direction === 'desc' ? 'active-sort-Owner-Dashboard' : ''}`} size={14} />
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="table-body-Owner-Dashboard">
                {filteredRecentInvoices.map((invoice) => (
                  <tr className="table-row-Owner-Dashboard" key={invoice.id}>
                    <td className="table-data-Owner-Dashboard table-col-name-Owner-Dashboard" data-label="TENANT">
                      <span className="data-text-Owner-Dashboard">{invoice.tenant}</span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-date-Owner-Dashboard" data-label="DUE DATE">
                      <span className="data-text-Owner-Dashboard">{invoice.dueDate}</span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-amount-Owner-Dashboard" data-label="AMOUNT">
                      <span className="data-text-Owner-Dashboard">{invoice.amount}</span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-status-Owner-Dashboard" data-label="STATUS">
                      <span className={`status-badge-Owner-Dashboard ${
                        invoice.status === 'PAID' ? 'status-paid-Owner-Dashboard' : 
                        invoice.status === 'OVERDUE' ? 'status-overdue-Owner-Dashboard' : 
                        'status-pending-Owner-Dashboard'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="table-data-Owner-Dashboard table-col-invoice-Owner-Dashboard" data-label="INVOICE NO.">
                      <span className="data-text-Owner-Dashboard">{invoice.invoiceNo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;