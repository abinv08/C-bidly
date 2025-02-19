import React, { useState } from 'react';
// import { 
//   Bell, 
//   Users, 
//   ShoppingCart, 
//   DollarSign, 
//   AlertTriangle,
//   ChevronDown,
//   Search,
//   MoreVertical,
//   Ban,
//   Check
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data - In real app, this would come from your backend
  const recentAuctions = [
    { id: 1, seller: "Farmer Kumar", item: "Premium Cardamom", amount: "₹45,000", status: "Completed" },
    { id: 2, seller: "Farmer Rajan", item: "Grade A Cardamom", amount: "₹38,000", status: "In Progress" },
    { id: 3, seller: "Farmer Suresh", item: "Organic Cardamom", amount: "₹52,000", status: "Pending" }
  ];

  const pendingUsers = [
    { id: 1, name: "Anand K", type: "Farmer", status: "Pending", location: "Idukki" },
    { id: 2, name: "Rajesh M", type: "Trader", status: "Pending", location: "Wayanad" }
  ];

  const statsData = [
    { title: "Total Users", value: "2,846", icon: Users },
    { title: "Active Auctions", value: "124", icon: ShoppingCart },
    { title: "Daily Revenue", value: "₹8.5L", icon: DollarSign },
    { title: "Pending Approvals", value: "18", icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">C-Bidly Admin Dashboard</h1>
          <p className="text-gray-600">Manage your cardamom trading platform</p>
        </div> */}
        {/* <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              A
            </div> */}
            <ChevronDown size={16} />
          </div>
        </div>
    //   </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-6">
              <div className="p-2 rounded-lg bg-blue-100 mr-4">
                {React.createElement(stat.icon, { size: 24, className: "text-blue-600" })}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Auctions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Auctions</CardTitle>
            <CardDescription>Monitor ongoing and completed auctions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Seller</th>
                    <th className="text-left py-3 px-4">Item</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAuctions.map((auction) => (
                    <tr key={auction.id} className="border-b">
                      <td className="py-3 px-4">{auction.seller}</td>
                      <td className="py-3 px-4">{auction.item}</td>
                      <td className="py-3 px-4">{auction.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          auction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          auction.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {auction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>New user registration requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.type} • {user.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 rounded-full text-red-600 hover:bg-red-50">
                        <Ban size={16} />
                      </button>
                      <button className="p-1 rounded-full text-green-600 hover:bg-green-50">
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    // </div>
  );
};

export default AdminDashboard;