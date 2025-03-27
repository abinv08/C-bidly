import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Import icons from lucide-react
import { 
  Users, Sprout, ShoppingCart, 
  MessageSquare, Settings, LogOut, 
  Menu, BarChart2, Search
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Sample data - replace with actual data from your backend
  const dashboardData = {
    totalUsers: 1524,
    activeFarmers: 856,
    activeBuyers: 668,
    pendingApprovals: 23,
    recentTransactions: [
      { id: 1, farmer: 'John Smith', buyer: 'Green Grocers', product: 'Organic Tomatoes', amount: 1250, status: 'completed' },
      { id: 2, farmer: 'Maria Garcia', buyer: 'Fresh Markets', product: 'Sweet Corn', amount: 880, status: 'pending' },
      // Add more transactions
    ],
    recentUsers: [
      { id: 1, name: 'Alice Johnson', type: 'Farmer', status: 'active', joinDate: '2025-01-10' },
      { id: 2, name: 'Bob Wilson', type: 'Buyer', status: 'pending', joinDate: '2025-01-12' },
      // Add more users
    ]
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Fixed positioning */}
      <aside className={`fixed h-full bg-[#1b5e20] text-white p-4 flex flex-col transition-width duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
          <Link to="/" className="text-white no-underline text-2xl font-bold">
            {isSidebarCollapsed ? 'F' : 'Farmily'}
          </Link>
          <button 
            className="bg-transparent border-none text-white cursor-pointer p-2"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-2">
          <button 
            className={`flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer transition-colors ${activeSection === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <BarChart2 size={20} />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button 
            className={`flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer transition-colors ${activeSection === 'farmers' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setActiveSection('farmers')}
          >
            <Sprout size={20} />
            {!isSidebarCollapsed && <span>Farmers</span>}
          </button>
          <button 
            className={`flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer transition-colors ${activeSection === 'buyers' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setActiveSection('buyers')}
          >
            <ShoppingCart size={20} />
            {!isSidebarCollapsed && <span>Buyers</span>}
          </button>
          <button 
            className={`flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer transition-colors ${activeSection === 'users' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setActiveSection('users')}
          >
            <Users size={20} />
            {!isSidebarCollapsed && <span>Users</span>}
          </button>
          <button 
            className={`flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer transition-colors ${activeSection === 'messages' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setActiveSection('messages')}
          >
            <MessageSquare size={20} />
            {!isSidebarCollapsed && <span>Messages</span>}
          </button>
          <button 
            className={`flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer transition-colors ${activeSection === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setActiveSection('settings')}
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>

        <button className="flex items-center gap-4 py-3 px-4 text-white bg-transparent border-none rounded cursor-pointer mt-auto hover:bg-white/10">
          <LogOut size={20} />
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content - Add left margin to accommodate fixed sidebar */}
      <main className={`flex-grow bg-gray-100 p-4 overflow-y-auto ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white rounded-lg mb-8 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 py-2 px-4 rounded w-72">
            <Search size={20} />
            <input type="text" placeholder="Search..." className="border-none bg-transparent outline-none w-full" />
          </div>
          <div className="flex items-center gap-4">
            <img 
              src="/api/placeholder/32/32" 
              alt="Admin" 
              className="w-8 h-8 rounded-full" 
            />
            <span>Admin Name</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
              <div className="p-4 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
                <p className="text-2xl font-semibold text-gray-800">{dashboardData.totalUsers}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
              <div className="p-4 rounded-lg flex items-center justify-center bg-green-100 text-green-700">
                <Sprout size={24} />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Active Farmers</h3>
                <p className="text-2xl font-semibold text-gray-800">{dashboardData.activeFarmers}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
              <div className="p-4 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Active Buyers</h3>
                <p className="text-2xl font-semibold text-gray-800">{dashboardData.activeBuyers}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
              <div className="p-4 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Pending Approvals</h3>
                <p className="text-2xl font-semibold text-gray-800">{dashboardData.pendingApprovals}</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Farmer</th>
                    <th className="text-left py-3 px-4">Buyer</th>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentTransactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">{transaction.farmer}</td>
                      <td className="py-3 px-4">{transaction.buyer}</td>
                      <td className="py-3 px-4">{transaction.product}</td>
                      <td className="py-3 px-4">${transaction.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Join Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.joinDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition-colors">Edit</button>
                          <button className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;