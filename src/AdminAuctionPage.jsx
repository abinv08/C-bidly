import React, { useState, useEffect } from 'react';
import { FaBox, FaDollarSign, FaUsers, FaEdit, FaTrash, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, deleteDoc, query, orderBy, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

const AuctionAdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalLots: 0,
    averagePrice: 0,
    totalParticipants: 0
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleActivateAuction = async (auctionId) => {
    if (window.confirm("Are you sure you want to publish this auction? It will be visible to bidders.")) {
      try {
        const db = getFirestore();
        const auctionRef = doc(db, "cardamomAuctions", auctionId);

        const auctionSnap = await getDocs(query(collection(db, "cardamomAuctions"), orderBy("createdAt", "desc")));
        let auctionData = null;

        auctionSnap.forEach((doc) => {
          if (doc.id === auctionId) {
            auctionData = { id: doc.id, ...doc.data() };
          }
        });

        if (!auctionData) throw new Error("Auction data not found");

        await updateDoc(auctionRef, { status: 'active', lastUpdated: new Date() });
        const publishedAuctionRef = doc(db, "auctionlotpub", auctionId);
        await setDoc(publishedAuctionRef, {
          ...auctionData,
          status: 'active',
          publishedAt: new Date(),
          lastUpdated: new Date()
        });

        alert("Auction published successfully!");
      } catch (error) {
        console.error("Error publishing auction:", error);
        alert("Failed to publish auction. Please try again.");
      }
    }
  };

  useEffect(() => {
    const db = getFirestore();
    const auctionsCollection = collection(db, "cardamomAuctions");
    const q = query(auctionsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const auctionData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          auctionData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Date ? data.createdAt :
              data.createdAt && data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000) :
                new Date(),
          });
        });

        setAuctions(auctionData);
        calculateStats(auctionData);

        if (auctionData.length > 0) {
          const dates = auctionData.map(auction =>
            auction.createdAt ? auction.createdAt.toDateString() : 'Unknown Date'
          );
          const uniqueDates = [...new Set(dates)].sort((a, b) => {
            if (a === 'Unknown Date') return 1;
            if (b === 'Unknown Date') return -1;
            return new Date(b) - new Date(a);
          });

          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
          }
        }

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

    return () => unsubscribe();
  }, []);

  const calculateStats = (auctionData) => {
    if (!auctionData.length) return;

    const activeCount = auctionData.filter(a => a.status !== 'closed').length;
    let totalLotsSum = 0, priceSum = 0, participantsSum = 0;

    auctionData.forEach(auction => {
      totalLotsSum += parseInt(auction.totalLots || 0);
      priceSum += parseFloat(auction.auctionAvg || 0);
      participantsSum += parseInt(auction.totalParticipates || 0);
    });

    setStats({
      activeAuctions: activeCount || auctionData.length,
      totalLots: totalLotsSum,
      averagePrice: priceSum / (auctionData.filter(a => a.auctionAvg).length || 1),
      totalParticipants: participantsSum
    });
  };

  const handleEdit = (auction) => {
    const preFillData = {
      id: auction.id,
      auctionNo: auction.auctionNo || '',
      auctionCenter: auction.auctionCenter || '',
      auctioneer: auction.lotDetails?.sellerName || auction.auctioneer || '',
      totalQuantity: auction.lotDetails?.totalQuantity || auction.totalQuantity || '',
      numberOfBags: auction.lotDetails?.numberOfBags || '',
      lotQuantity: auction.lotDetails?.bagSize || '',
      processingLotNumber: auction.lotDetails?.lotNumber || '',
      minimum: auction.minimum || '',
      maximum: auction.maximum || '',
      auctionAvg: auction.auctionAvg || '',
      totalParticipates: auction.totalParticipates || '',
      totalLots: auction.totalLots || '',
      lotDetails: {
        grade: auction.lotDetails?.grade || '',
        totalQuantity: auction.lotDetails?.totalQuantity || '',
        numberOfBags: auction.lotDetails?.numberOfBags || '',
        bagSize: auction.lotDetails?.bagSize || '',
        lotNumber: auction.lotDetails?.lotNumber || '',
        sellerName: auction.lotDetails?.sellerName || ''
      },
      status: auction.status || 'pending',
      createdAt: auction.createdAt
    };
    navigate('/AuctionAdd', { state: { preFillData, isEdit: true } });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this auction? This action cannot be undone.")) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "cardamomAuctions", id));
        await deleteDoc(doc(db, "auctionlotpub", id));
      } catch (error) {
        console.error("Error deleting auction:", error);
        alert("Failed to delete auction. Please try again.");
      }
    }
  };

  const groupedAuctions = auctions.reduce((groups, auction) => {
    const date = auction.createdAt ? auction.createdAt.toDateString() : 'Unknown Date';
    if (!groups[date]) groups[date] = [];
    groups[date].push(auction);
    return groups;
  }, {});

  const getDateLabel = (dateString) => {
    if (dateString === 'Unknown Date') return 'Unknown Date';

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (dateString === today) return 'Today';
    if (dateString === yesterdayString) return 'Yesterday';

    return dateString;
  };

  const auctionDates = Object.keys(groupedAuctions).sort((a, b) => {
    if (a === 'Unknown Date') return 1;
    if (b === 'Unknown Date') return -1;
    return new Date(b) - new Date(a);
  });

  const filteredAuctions = selectedDate ? groupedAuctions[selectedDate] : auctions;

  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false);

  const handleViewDetails = (auction) => {
    const minPrice = parseFloat(auction.minimum || 0);
    const maxPrice = parseFloat(auction.maximum || 0);
    const avgPrice = (minPrice + maxPrice) / 2;

    const auctionWithAvg = {
      ...auction,
      auctionAvg: String(avgPrice)
    };

    setSelectedAuction(auctionWithAvg);
    setUpdatedFields({
      auctionAvg: String(avgPrice)
    });
    setHasBeenUpdated(false);
    setShowDetailsPopup(true);
  };

  const handleUpdateAuction = async () => {
    if (!selectedAuction || Object.keys(updatedFields).length === 0) return;

    try {
      const db = getFirestore();
      const auctionRef = doc(db, "cardamomAuctions", selectedAuction.id);

      await updateDoc(auctionRef, {
        ...updatedFields,
        lastUpdated: new Date()
      });

      if (selectedAuction.status === 'active') {
        const publishedAuctionRef = doc(db, "auctionlotpub", selectedAuction.id);
        await updateDoc(publishedAuctionRef, {
          ...updatedFields,
          lastUpdated: new Date()
        });
      }

      setHasBeenUpdated(true);
      alert("Auction updated successfully!");
    } catch (error) {
      console.error("Error updating auction:", error);
      alert("Failed to update auction. Please try again.");
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === 'auctionCenter') {
      setUpdatedFields({
        ...updatedFields,
        auctionCenter: value
      });
    } else if (field.startsWith('lotDetails.')) {
      const lotField = field.split('.')[1];
      setUpdatedFields({
        ...updatedFields,
        lotDetails: {
          ...updatedFields.lotDetails,
          [lotField]: value
        }
      });
    } else {
      setUpdatedFields({
        ...updatedFields,
        [field]: value
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'active': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'closed': return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Closed</span>;
      default: return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{status || 'Unknown'}</span>;
    }
  };

  const isAuctionReadyToPublish = (auction) => {
    const requiredFields = [
      auction.auctionNo,
      auction.auctionCenter,
      auction.auctioneer || auction.lotDetails?.sellerName,
      auction.totalQuantity || auction.lotDetails?.totalQuantity,
      auction.minimum,
      auction.maximum
    ];

    const hasRequiredLotDetails =
      auction.lotDetails &&
      auction.lotDetails.lotNumber &&
      auction.lotDetails.grade &&
      auction.lotDetails.numberOfBags &&
      auction.lotDetails.bagSize;

    return requiredFields.every(field => field && field.toString().trim() !== '') && hasRequiredLotDetails;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-600"></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="flex items-center p-4"><FaCalendarAlt className="w-6 h-6 text-blue-500 mr-3" /><div><p className="text-sm text-gray-600">Active Auctions</p><p className="text-xl font-bold">{stats.activeAuctions}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-4"><FaBox className="w-6 h-6 text-green-500 mr-3" /><div><p className="text-sm text-gray-600">Total Lots</p><p className="text-xl font-bold">{stats.totalLots}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-4"><FaDollarSign className="w-6 h-6 text-yellow-500 mr-3" /><div><p className="text-sm text-gray-600">Average Price</p><p className="text-xl font-bold">₹{stats.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-4"><FaUsers className="w-6 h-6 text-purple-500 mr-3" /><div><p className="text-sm text-gray-600">Total Participants</p><p className="text-xl font-bold">{stats.totalParticipants}</p></div></CardContent></Card>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">Filter by Date:</h3>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="ml-4 text-sm text-blue-600 hover:text-blue-800">Clear Filter</button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {auctionDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-1 rounded-full text-sm ${selectedDate === date ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {getDateLabel(date)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="mb-8"><CardContent className="p-8 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div><p className="mt-4">Loading auction data...</p></CardContent></Card>
      ) : error ? (
        <Card className="mb-8"><CardContent className="p-8 text-center text-red-600"><p>{error}</p></CardContent></Card>
      ) : filteredAuctions.length === 0 ? (
        <Card className="mb-8"><CardContent className="p-8 text-center"><p>No auctions found. Click "Add to Auction" to add one.</p></CardContent></Card>
      ) : (
        <Card className="mb-8">
          <CardHeader><div className="text-xl font-bold p-4">{selectedDate ? `Auctions on ${selectedDate}` : 'All Auctions'}</div></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">Auction No/Date</th>
                    <th className="text-left py-3 px-4">Center</th>
                    <th className="text-left py-3 px-4">Auctioneer</th>
                    <th className="text-left py-3 px-4">Lot Details</th>
                    <th className="text-left py-3 px-4">Total Quantity</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Min Price</th>
                    <th className="text-left py-3 px-4">Max Price</th>
                    <th className="text-left py-3 px-4">Auction Avg</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.map((auction) => (
                    <tr key={auction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4"><div className="font-medium">{auction.auctionNo}</div><div className="text-xs text-gray-500">{auction.createdAt ? auction.createdAt.toLocaleDateString() : 'Unknown date'}</div></td>
                      <td className="py-3 px-4">{auction.auctionCenter}</td>
                      <td className="py-3 px-4">{auction.auctioneer || auction.lotDetails?.sellerName || "Not specified"}</td>
                      <td className="py-3 px-4">
                        {auction.lotDetails ? (
                          <div className="text-sm">
                            <div><span className="font-medium">Lot:</span> #{auction.lotDetails.lotNumber}</div>
                            <div><span className="font-medium">Seller:</span> {auction.lotDetails.sellerName}</div>
                            <div><span className="font-medium">Grade:</span> {auction.lotDetails.grade || 'Not specified'}</div>
                          </div>
                        ) : (
                          <div className="text-sm"><span className="text-gray-500">No lot details</span></div>
                        )}
                      </td>
                      <td className="py-3 px-4"><div className="flex flex-col"><span>{auction.totalQuantity} Kg</span>{auction.lotDetails && auction.lotDetails.numberOfBags && (<span className="text-xs text-gray-600">{auction.lotDetails.numberOfBags} bags × {auction.lotDetails.bagSize} kg</span>)}</div></td>
                      <td className="py-3 px-4">{getStatusBadge(auction.status)}</td>
                      <td className="py-3 px-4">₹{parseInt(auction.minimum || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">₹{parseInt(auction.maximum || 0).toLocaleString()}</td>
                      <td className="py-3 px-4"><span className="font-semibold">₹{parseInt(auction.auctionAvg || 0).toLocaleString()}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetails(auction)} className="p-1 hover:bg-green-100 rounded text-green-600" title="View/Edit auction details"><FaBox size={16} /></button>
                          <button onClick={() => handleDelete(auction.id)} className="p-1 hover:bg-red-100 rounded text-red-500" title="Delete auction"><FaTrash size={16} /></button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><div className="text-lg font-bold p-4">Auction Status Summary</div></CardHeader><CardContent><div className="space-y-4"><div className="flex justify-between items-center"><span>Pending</span><span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">{auctions.filter(a => a.status === 'pending').length}</span></div><div className="flex justify-between items-center"><span>Active</span><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">{auctions.filter(a => a.status === 'active').length}</span></div><div className="flex justify-between items-center"><span>Closed</span><span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">{auctions.filter(a => a.status === 'closed').length}</span></div><div className="flex justify-between items-center"><span>Total Auctions</span><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{auctions.length}</span></div></div></CardContent></Card>

        <Card><CardHeader><div className="text-lg font-bold p-4">Recent Activity</div></CardHeader><CardContent>{auctions.length > 0 ? (
          <div className="space-y-3">{auctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((auction, index) => (
            <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0"><div className="flex-shrink-0"><div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><FaCalendarAlt className="text-blue-500" /></div></div><div className="flex-grow"><p className="text-sm font-medium">Auction {auction.auctionNo} {auction.status === 'pending' ? 'created' : auction.status === 'active' ? 'activated' : 'closed'}</p><p className="text-xs text-gray-500">{auction.createdAt.toLocaleString()}</p>{auction.auctioneer && (<p className="text-xs text-gray-600">Auctioneer: {auction.auctioneer}</p>)}</div></div>
          ))}</div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}</CardContent></Card>
      </div>

      {showDetailsPopup && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Auction Details</h2>
              <button onClick={() => setShowDetailsPopup(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auction No</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  defaultValue={selectedAuction.auctionNo}
                  onChange={(e) => handleFieldChange('auctionNo', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auction Center</label>
                <select
                  className="w-full p-2 border rounded"
                  value={updatedFields.auctionCenter || selectedAuction.auctionCenter || ''}
                  onChange={(e) => handleFieldChange('auctionCenter', e.target.value)}
                >
                  <option value="">Select Auction Center</option>
                  <option value="Puttady">Puttady</option>
                  <option value="Bodinayakanur">Bodinayakanur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auctioneer</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  defaultValue={selectedAuction.auctioneer || selectedAuction.lotDetails?.sellerName}
                  onChange={(e) => handleFieldChange('auctioneer', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity (kg)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue={selectedAuction.totalQuantity || selectedAuction.lotDetails?.totalQuantity}
                  onChange={(e) => handleFieldChange('totalQuantity', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Price (₹)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue={selectedAuction.minimum || ''}
                  onChange={(e) => {
                    const newMin = parseFloat(e.target.value || 0);
                    const maxPrice = parseFloat(updatedFields.maximum || selectedAuction.maximum || 0);
                    const newAvg = (newMin + maxPrice) / 2;

                    setUpdatedFields(prev => ({
                      ...prev,
                      minimum: e.target.value,
                      auctionAvg: String(newAvg)
                    }));

                    const avgInput = document.getElementById('auctionAvgInput');
                    if (avgInput) avgInput.value = newAvg;
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Price (₹)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue={selectedAuction.maximum || ''}
                  onChange={(e) => {
                    const minPrice = parseFloat(updatedFields.minimum || selectedAuction.minimum || 0);
                    const newMax = parseFloat(e.target.value || 0);
                    const newAvg = (minPrice + newMax) / 2;

                    setUpdatedFields(prev => ({
                      ...prev,
                      maximum: e.target.value,
                      auctionAvg: String(newAvg)
                    }));

                    const avgInput = document.getElementById('auctionAvgInput');
                    if (avgInput) avgInput.value = newAvg;
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Price (₹)</label>
                <input
                  id="auctionAvgInput"
                  type="number"
                  className="w-full p-2 border rounded bg-gray-50"
                  value={updatedFields.auctionAvg || selectedAuction.auctionAvg || ''}
                  readOnly
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Lot Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    defaultValue={selectedAuction.lotDetails?.lotNumber}
                    onChange={(e) => handleFieldChange('lotDetails.lotNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    defaultValue={selectedAuction.lotDetails?.grade}
                    onChange={(e) => handleFieldChange('lotDetails.grade', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bags</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    defaultValue={selectedAuction.lotDetails?.numberOfBags}
                    onChange={(e) => handleFieldChange('lotDetails.numberOfBags', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bag Size (kg)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    defaultValue={selectedAuction.lotDetails?.bagSize}
                    onChange={(e) => handleFieldChange('lotDetails.bagSize', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Created: {selectedAuction.createdAt ? selectedAuction.createdAt.toLocaleString() : 'Unknown date'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAuction}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Auction
                </button>
                {selectedAuction.status !== 'active' && (
                  <button
                    onClick={() => {
                      setShowDetailsPopup(false);
                      handleActivateAuction(selectedAuction.id);
                    }}
                    className={`px-4 py-2 rounded ${hasBeenUpdated
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    disabled={!hasBeenUpdated}
                    title={!hasBeenUpdated
                      ? "Please update the auction first before publishing"
                      : "Publish this auction"
                    }
                  >
                    Publish Auction
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionAdminDashboard;