import React, { useState, useEffect } from 'react';
import { FaPlus, FaBox, FaDollarSign, FaUsers, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const AuctionAdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalLots: 0,
    averagePrice: 0,
    totalParticipants: 0
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch auctions from Firestore with real-time updates
  useEffect(() => {
    const db = getFirestore();
    const auctionsCollection = collection(db, "cardamomAuctions");  // Changed
    const q = query(auctionsCollection, orderBy("createdAt", "desc"));
    
    // Set up real-time listener instead of one-time fetch
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const auctionData = [];
        querySnapshot.forEach((doc) => {
          // Format the data and add it to our state
          const data = doc.data();
          auctionData.push({
            id: doc.id,
            ...data,
            // Convert timestamp to Date if it exists
            createdAt: data.createdAt instanceof Date ? data.createdAt : 
                      data.createdAt && data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000) : 
                      new Date(),
          });
        });
        
        setAuctions(auctionData);
        calculateStats(auctionData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing auctions:", err);
        setError("Failed to load auction data. Please try again later.");
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching auctions:", err);
      setError("Failed to load auction data. Please try again later.");
      setLoading(false);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Calculate dashboard statistics
  const calculateStats = (auctionData) => {
    if (!auctionData.length) return;

    const activeCount = auctionData.filter(a => a.status !== 'closed').length;
    
    let totalLotsSum = 0;
    let priceSum = 0;
    let participantsSum = 0;

    auctionData.forEach(auction => {
      totalLotsSum += parseInt(auction.totalLots || 0);
      priceSum += parseFloat(auction.auctionAvg || 0);
      participantsSum += parseInt(auction.totalParticipates || 0);
    });

    setStats({
      activeAuctions: activeCount || auctionData.length, // Default to all if status not set
      totalLots: totalLotsSum,
      averagePrice: priceSum / (auctionData.filter(a => a.auctionAvg).length || 1),
      totalParticipants: participantsSum
    });
  };

  const handleEdit = (auction) => {
    navigate(`/AuctionAdd/${auction.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this auction? This action cannot be undone.")) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "cardamomAuctions", id));
        
        // No need to update local state - the listener will handle that
        // alert("Auction deleted successfully!");
      } catch (error) {
        console.error("Error deleting auction:", error);
        alert("Failed to delete auction. Please try again.");
      }
    }
  };

  const handleViewDetails = (auction) => {
    navigate(`/AuctionDetails/${auction.id}`, { state: { auction } });
  };

  const handleNewAuctionClick = () => {
    navigate('/AuctionAdd');
  };

  // Group auctions by date
  const groupedAuctions = auctions.reduce((groups, auction) => {
    const date = auction.createdAt ? auction.createdAt.toDateString() : 'Unknown Date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(auction);
    return groups;
  }, {});

  // Get unique dates for filtering
  const auctionDates = Object.keys(groupedAuctions).sort((a, b) => {
    if (a === 'Unknown Date') return 1;
    if (b === 'Unknown Date') return -1;
    return new Date(b) - new Date(a); // Most recent first
  });

  // Filter auctions by selected date or show all if none selected
  const filteredAuctions = selectedDate 
    ? groupedAuctions[selectedDate] 
    : auctions;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Closed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-600">Manage cardamom auctions</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleNewAuctionClick} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
            <FaPlus size={16} />
            New Auction
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-4">
            <FaCalendarAlt className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Auctions</p>
              <p className="text-xl font-bold">{stats.activeAuctions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FaBox className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Lots</p>
              <p className="text-xl font-bold">{stats.totalLots}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FaDollarSign className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-xl font-bold">₹{stats.averagePrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <FaUsers className="w-6 h-6 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-xl font-bold">{stats.totalParticipants}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold">Filter by Date:</h3>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              className="ml-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {auctionDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedDate === date 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4">Loading auction data...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="mb-8">
          <CardContent className="p-8 text-center text-red-600">
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : filteredAuctions.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <p>No auctions found. Click "New Auction" to add one.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <div className="text-xl font-bold p-4">
              {selectedDate ? `Auctions on ${selectedDate}` : 'All Auctions'}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">Auction No/Date</th>
                    <th className="text-left py-3 px-4">Center</th>
                    <th className="text-left py-3 px-4">Lot Details</th>
                    <th className="text-left py-3 px-4">Total Quantity</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Min-Max Price</th>
                    <th className="text-left py-3 px-4">Auction Avg</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.map((auction) => (
                    <tr key={auction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{auction.auctionNo}</div>
                        <div className="text-xs text-gray-500">
                          {auction.createdAt ? auction.createdAt.toLocaleDateString() : 'Unknown date'}
                        </div>
                      </td>
                      <td className="py-3 px-4">{auction.auctionCenter}</td>
                      <td className="py-3 px-4">
                        {auction.lotDetails ? (
                          <div className="text-sm">
                            <div><span className="font-medium">Lot:</span> #{auction.lotDetails.lotNumber}</div>
                            <div><span className="font-medium">Seller:</span> {auction.lotDetails.sellerName}</div>
                            <div><span className="font-medium">Grade:</span> {auction.lotDetails.grade}</div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="text-gray-500">No lot details</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>{auction.totalQuantity} Kg</span>
                          {auction.lotDetails && auction.lotDetails.numberOfBags && (
                            <span className="text-xs text-gray-600">
                              {auction.lotDetails.numberOfBags} bags × {auction.lotDetails.bagSize} kg
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(auction.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-green-600">
                            ₹{parseInt(auction.minimum || 0).toLocaleString()} - 
                            ₹{parseInt(auction.maximum || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          ₹{parseInt(auction.auctionAvg || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewDetails(auction)}
                            className="p-1 hover:bg-green-100 rounded text-green-600" 
                            title="View auction details"
                          >
                            <FaBox size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(auction)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600" 
                            title="Edit auction"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(auction.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500" 
                            title="Delete auction"
                          >
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
      )}

      {/* Recently Added Lots Section */}
      {auctions.filter(a => a.lotDetails).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recently Added Lots</h2>
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4">Lot #</th>
                      <th className="text-left py-3 px-4">Seller</th>
                      <th className="text-left py-3 px-4">Grade</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Auction No</th>
                      <th className="text-left py-3 px-4">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctions
                      .filter(auction => auction.lotDetails)
                      .sort((a, b) => {
                        // Sort by date added, most recent first
                        return new Date(b.createdAt) - new Date(a.createdAt);
                      })
                      .slice(0, 5) // Only show the 5 most recent
                      .map((auction) => (
                        <tr key={`lot-${auction.id}`} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            #{auction.lotDetails.lotNumber}
                          </td>
                          <td className="py-3 px-4">
                            {auction.lotDetails.sellerName}
                          </td>
                          <td className="py-3 px-4">
                            {auction.lotDetails.grade || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {auction.lotDetails.totalQuantity} kg
                            {auction.lotDetails.numberOfBags && auction.lotDetails.bagSize && (
                              <span className="text-xs text-gray-600 block">
                                {auction.lotDetails.numberOfBags} bags × {auction.lotDetails.bagSize} kg
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-blue-600">
                              {auction.auctionNo}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {auction.createdAt.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auction Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="text-lg font-bold p-4">Auction Status Summary</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  {auctions.filter(a => a.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {auctions.filter(a => a.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Closed</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                  {auctions.filter(a => a.status === 'closed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Auctions</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {auctions.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-lg font-bold p-4">Recent Activity</div>
          </CardHeader>
          <CardContent>
            {auctions.length > 0 ? (
              <div className="space-y-3">
                {auctions
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((auction, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaCalendarAlt className="text-blue-500" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">
                          Auction {auction.auctionNo} {auction.status === 'pending' ? 'created' : 
                             auction.status === 'active' ? 'activated' : 'closed'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {auction.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuctionAdminDashboard;