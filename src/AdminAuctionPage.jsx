import React, { useState } from 'react';
import { FaPlus, FaBox, FaDollarSign, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';  // Importing the Plus icon
import { Card, CardContent, CardHeader } from '@mui/material';
import Calendar from 'react-calendar';  // Assuming react-calendar is installed
import { useNavigate } from 'react-router-dom';


const AuctionAdminDashboard = () => {
  const [selectedAuction, setSelectedAuction] = useState(null);
  
  // Sample auction data
  const [auctions, setAuctions] = useState([
    {
      id: 1,
      auctionNo: "13/15-01-2025",
      center: "PUTTADY",
      planterQuantity: "48,319.7",
      dealerQuantity: "12,909.4",
      minimumPrice: 2650,
      maximumPrice: 3800,
      growerAvg: 3540,
      dealerAvg: 3550,
      totalParticipants: 54,
      totalQuantity: "61,229.1",
      processingLotNumber: 3,
      auctionAvg: 3200,
      totalLots: 302,
      lotsRemaining: 240,
      lotsSold: 62,
      lotsWithdrawn: 0,
      currentPrice: 3500,
      status: "active"
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);

  const handleEdit = (auction) => {
    setIsEditing(true);
    setEditingAuction({ ...auction });
  };

  const handleSave = () => {
    setAuctions(auctions.map(auction => 
      auction.id === editingAuction.id ? editingAuction : auction
    ));
    setIsEditing(false);
    setEditingAuction(null);
  };
  const navigate = useNavigate();  // Hook for programmatic navigation

  const handleNewAuctionClick = () => {
    // Navigate to the "Add Auction" page
    navigate('/AuctionAdd');
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8 min-w-[78rem]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-600">Manage live cardamom auctions</p>
        </div> */}
        <div className="flex gap-4">
          <button onClick={handleNewAuctionClick} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
            <FaPlus size={20} />  {/* Using the imported FaPlus icon */}
            New Auction
          </button>
        </div>
      </div>
      {/* The rest of your code */}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-4">
            {/* <Calendar className="w-8 h-8 text-blue-500 mr-3" /> */}
            <div>
              <p className="text-sm text-gray-600">Active Auctions</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FaBox className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Lots Today</p>
              <p className="text-xl font-bold">302</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FaDollarSign className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-xl font-bold">₹3,200</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FaUsers className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-xl font-bold">54</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardHeader>Current Auctions</CardHeader>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Auction No</th>
                  <th className="text-left py-3 px-4">Center</th>
                  <th className="text-left py-3 px-4">Total Quantity</th>
                  <th className="text-left py-3 px-4">Current Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auction) => (
                  <tr key={auction.id} className="border-b">
                    <td className="py-3 px-4">{auction.auctionNo}</td>
                    <td className="py-3 px-4">{auction.center}</td>
                    <td className="py-3 px-4">{auction.totalQuantity} Kg</td>
                    <td className="py-3 px-4">₹{auction.currentPrice}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(auction)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Auction Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardHeader>Edit Auction Details</CardHeader>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auction No</label>
                  <input 
                    type="text"
                    value={editingAuction.auctionNo}
                    onChange={(e) => setEditingAuction({...editingAuction, auctionNo: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Center</label>
                  <input 
                    type="text"
                    value={editingAuction.center}
                    onChange={(e) => setEditingAuction({...editingAuction, center: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Price</label>
                  <input 
                    type="number"
                    value={editingAuction.minimumPrice}
                    onChange={(e) => setEditingAuction({...editingAuction, minimumPrice: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Price</label>
                  <input 
                    type="number"
                    value={editingAuction.maximumPrice}
                    onChange={(e) => setEditingAuction({...editingAuction, maximumPrice: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuctionAdminDashboard;
