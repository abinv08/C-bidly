import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import AdminAuctionPage from './AdminAuctionPage';
import './DashboardPage.css';
import AprovalPanel from './AprovalPanel';

const DashboardPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Sample data for the growth chart
  const growthData = [
    { name: 'Jan', value: 20 },
    { name: 'Feb', value: 35 },
    { name: 'Mar', value: 45 },
    { name: 'Apr', value: 30 },
  ];

  // Card component
  const Card = ({ children, className }) => (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );

  // Dashboard content component
  const DashboardContent = () => (
    <div className="main-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { title: 'Users', value: '45' },
          { title: 'Sellers', value: '25' },
          { title: 'Buyer', value: '25' },
          { title: 'Bid', value: '7' },
        ].map((stat) => (
          <Card key={stat.title}>
            <h3 className="stat-title">{stat.title}</h3>
            <p className="stat-value">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Growth Chart */}
        <Card>
          <h3 className="chart-title">Page Growth Chart</h3>
          <BarChart width={400} height={200} data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" />
          </BarChart>
        </Card>

        {/* Users Type */}
        <Card>
          <h3 className="chart-title">Users Type</h3>
          <div className="users-type-list">
            {['seller', 'Buyer', 'Price'].map((type) => (
              <div key={type} className="type-item">
                <div className="type-indicator"></div>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // Render content based on current page
  const renderContent = () => {
    switch(currentPage) {
      case 'auction':
        return <AdminAuctionPage />;
      case 'dashboard':
        return <DashboardContent />;
      case 'aprovals': 
        return <AprovalPanel/>
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-title">Admin Panel</div>
        <nav className="sidebar-nav">
          {['Dashboard', 'Aprovals', 'Auction', 'Accounts', 'Review'].map((item) => (
            <button
              key={item}
              className={`nav-button ${currentPage === item.toLowerCase() ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.toLowerCase())}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default DashboardPage;