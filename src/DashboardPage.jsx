import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import AdminAuctionPage from './AdminAuctionPage';
import AprovalPanel from './AprovalPanel';
import LotApproval from './LotApproval';

const DashboardPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAuctions, setShowAuctions] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [biddingStartedLots, setBiddingStartedLots] = useState(new Set());

  useEffect(() => {
    if (!showAuctions) return;

    setLoading(true);
    const db = getFirestore();
    const publishedAuctionsCollection = collection(db, "auctionlotpub");
    const q = query(publishedAuctionsCollection, orderBy("publishedAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const auctionData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          auctionData.push({
            id: doc.id,
            ...data,
            createdAt: data.publishedAt instanceof Date ? data.publishedAt :
                      data.publishedAt && data.publishedAt.seconds ? new Date(data.publishedAt.seconds * 1000) :
                      data.createdAt instanceof Date ? data.createdAt :
                      data.createdAt && data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000) :
                      new Date(),
            biddingStarted: data.biddingStarted || false,
            sold: data.sold || false,
            bidValue1: data.bidValue1 || '',
            bidValue2: data.bidValue2 || ''
          });
        });

        const lotsFromAuctions = auctionData.map((auction, index) => ({
          id: auction.id,
          number: auction.auctionNo || `A${index + 1}`,
          color: 'green',
          sold: auction.sold || false,
          auctionCenter: auction.auctionCenter,
          totalQuantity: auction.totalQuantity,
          auctioneer: auction.auctioneer,
          lotDetails: auction.lotDetails,
          minimum: auction.minimum,
          maximum: auction.maximum,
          biddingStarted: auction.biddingStarted || false,
          bidValue1: auction.bidValue1 || '',
          bidValue2: auction.bidValue2 || ''
        }));

        setAuctions(auctionData);
        setLots(lotsFromAuctions);

        // Update selectedLot if it exists in the new lots data to maintain input state
        if (selectedLot) {
          const updatedLot = lotsFromAuctions.find(lot => lot.id === selectedLot.id);
          if (updatedLot) {
            setSelectedLot(updatedLot);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error processing auctions:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [showAuctions]);

  const Card = ({ children, className }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:-translate-y-2 ${className || ''}`}>
      {children}
    </div>
  );

  const handleLotSelect = (lot) => {
    if (!lot.sold) {
      setSelectedLot(lot);
    }
  };

  const handleBid = async (lotId, bidValue1, bidValue2) => {
    try {
      const db = getFirestore();
      const auctionRef = doc(db, "auctionlotpub", lotId);
      
      await updateDoc(auctionRef, {
        biddingStarted: true,
        bidValue1: bidValue1 || '',
        bidValue2: bidValue2 || '',
        lastUpdated: new Date()
      });
      setBiddingStartedLots(prev => new Set(prev).add(lotId));
    } catch (error) {
      console.error("Error starting bidding:", error);
    }
  };

  const handleStopAuction = async (lotId) => {
    try {
      const db = getFirestore();
      const auctionRef = doc(db, "auctionlotpub", lotId);
      await updateDoc(auctionRef, {
        biddingStarted: false,
        sold: true,
        lastUpdated: new Date()
      });
      
      const currentIndex = lots.findIndex(lot => lot.id === lotId);
      const nextAvailableLot = lots.slice(currentIndex + 1).find(lot => !lot.sold) || 
                              lots.slice(0, currentIndex).find(lot => !lot.sold);
      
      setSelectedLot(nextAvailableLot || null);
    } catch (error) {
      console.error("Error stopping auction:", error);
    }
  };

  // Validation function to prevent negative values
  const handleBidValueChange = (field, value) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    setSelectedLot(prev => ({ ...prev, [field]: numValue.toString() }));
  };

  const DashboardContent = () => (
    <div className="p-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Users', value: '45', icon: '👥' },
          { title: 'Sellers', value: '25', icon: '🏪' },
          { title: 'Buyer', value: '25', icon: '🛒' },
          { title: 'Bid', value: '7', icon: '🔨' },
        ].map((stat) => (
          <Card key={stat.title}>
            <div className="text-3xl mb-3">{stat.icon}</div>
            <h3 className="text-gray-600 font-semibold text-lg">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button
          onClick={() => setShowAuctions(true)}
          className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
                   bg-gradient-to-r from-green-500 to-green-600 
                   transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-3xl mb-2">🚀</span>
          Start Auction
        </button>

        <button
          className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
                   bg-gradient-to-r from-blue-500 to-blue-600 
                   transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-3xl mb-2">📦</span>
          Lot
        </button>

        <button
          className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
                   bg-gradient-to-r from-purple-500 to-purple-600 
                   transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-3xl mb-2">💰</span>
          Buy
        </button>
      </div>

      {showAuctions && (
        <div className="mt-8 w-full max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Available Auctions</h2>
          {loading ? (
            <div className="text-center py-4">Loading auctions...</div>
          ) : lots.length === 0 ? (
            <div className="text-center py-4">No active auctions available</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className={`p-3 flex items-center justify-center text-white font-bold rounded-lg 
                      ${lot.sold ? 'bg-red-800 cursor-not-allowed' : 'bg-green-900 cursor-pointer'}
                      ${selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleLotSelect(lot)}
                  >
                    <div className="text-center">
                      <div className="text-xl">{lot.number}</div>
                      <div className="text-xs">{lot.auctionCenter}</div>
                    </div>
                    {lot.sold && <div className="absolute text-xs font-normal">SOLD</div>}
                  </div>
                ))}
              </div>

              {selectedLot && (
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Current Auction Lot</h3>
                  <div className="mt-2">
                    <p><span className="font-semibold">Auction No:</span> {selectedLot.number}</p>
                    <p><span className="font-semibold">Center:</span> {selectedLot.auctionCenter}</p>
                    <p><span className="font-semibold">Auctioneer:</span> {selectedLot.auctioneer || "Not specified"}</p>
                    <p><span className="font-semibold">Quantity:</span> {selectedLot.totalQuantity}</p>
                    {selectedLot.lotDetails && (
                      <>
                        <p><span className="font-semibold">Lot Number:</span> {selectedLot.lotDetails.lotNumber}</p>
                        <p><span className="font-semibold">Seller:</span> {selectedLot.lotDetails.sellerName}</p>
                        <p><span className="font-semibold">Grade:</span> {selectedLot.lotDetails.grade}</p>
                      </>
                    )}
                    <p><span className="font-semibold">Minimum Price:</span> ₹{parseInt(selectedLot.minimum || 0).toLocaleString()}</p>
                    <p><span className="font-semibold">Maximum Price:</span> ₹{parseInt(selectedLot.maximum || 0).toLocaleString()}</p>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium">Bid Value 1:</label>
                      <input
                        type="number"
                        value={selectedLot.bidValue1}
                        onChange={(e) => handleBidValueChange('bidValue1', e.target.value)}
                        className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm p-2"
                        disabled={selectedLot.biddingStarted || selectedLot.sold}
                        min="0"
                        step="1"
                      />
                      <label className="block text-sm font-medium mt-2">Bid Value 2:</label>
                      <input
                        type="number"
                        value={selectedLot.bidValue2}
                        onChange={(e) => handleBidValueChange('bidValue2', e.target.value)}
                        className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm p-2"
                        disabled={selectedLot.biddingStarted || selectedLot.sold}
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    <div className="mt-4 flex gap-4">
                      <button 
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={() => handleBid(selectedLot.id, selectedLot.bidValue1, selectedLot.bidValue2)}
                        disabled={selectedLot.biddingStarted || selectedLot.sold || biddingStartedLots.has(selectedLot.id)}
                      >
                        {selectedLot.biddingStarted ? 'Bidding Started' : 'Start Bid'}
                      </button>
                      <button 
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={() => handleStopAuction(selectedLot.id)}
                        disabled={!selectedLot.biddingStarted || selectedLot.sold}
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'auction':
        return <AdminAuctionPage />;
      case 'aprovals':
        return <AprovalPanel />;
      case 'lot approval':
        return <LotApproval />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div className="w-full md:w-64 bg-green-700 p-4">
        <div className="text-white text-xl font-bold mb-8">Auctioneer Panel</div>
        <nav className="flex flex-col gap-2 -ml-0">
          {['Dashboard', 'Aprovals', 'Auction', 'Lot Approval', 'Review'].map((item) => (
            <button
              key={item}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                        text-white border-none cursor-pointer
                        ${currentPage === item.toLowerCase()
                  ? 'bg-green-600'
                  : 'bg-green-600 hover:bg-green-500'
                }`}
              onClick={() => setCurrentPage(item.toLowerCase())}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardPage;