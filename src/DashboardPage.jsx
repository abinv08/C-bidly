import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AdminAuctionPage from './AdminAuctionPage';
import AprovalPanel from './AprovalPanel';
import LotApproval from './LotApproval';

const DashboardPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAuctions, setShowAuctions] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [lots, setLots] = useState([]);
  const [displayedLots, setDisplayedLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [biddingStartedLots, setBiddingStartedLots] = useState(new Set());
  const [countdown, setCountdown] = useState(null);
  const [showSoldLots, setShowSoldLots] = useState(false);
  const [tempBidValues, setTempBidValues] = useState({ bidValue1: '', bidValue2: '' });
  const [bidEnabled, setBidEnabled] = useState(false);
  const [buyEnabled, setBuyEnabled] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Import Firebase auth
    import('firebase/auth').then(({ getAuth, signOut }) => {
      const auth = getAuth();

      // Sign out the user
      signOut(auth).then(() => {
        // Clear browser history and redirect
        // This will replace the current history entry instead of adding a new one
        window.history.replaceState(null, '', '/');

        // Force redirect to login page
        window.location.href = '/';

        // Alternative approach - prevent going back
        window.history.pushState(null, '', '/');
        window.addEventListener('popstate', function (event) {
          window.history.pushState(null, '', '/');
        });

      }).catch((error) => {
        console.error("Error signing out: ", error);
      });
    });
  };

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
            bidValue2: data.bidValue2 || '',
            soldAt: data.lastUpdated || data.publishedAt
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
          bidValue2: auction.bidValue2 || '',
          soldAt: auction.soldAt,
          paymentCompleted: auction.paymentCompleted || false // Add this line
        }));

        setAuctions(auctionData);
        setLots(lotsFromAuctions);

        // Filter and display lots based on showSoldLots state
        const filteredLots = lotsFromAuctions.filter(lot => lot.sold === showSoldLots);
        if (showSoldLots) {
          // Sort sold lots by soldAt date in descending order
          filteredLots.sort((a, b) => (b.soldAt?.seconds || 0) - (a.soldAt?.seconds || 0));
        }
        setDisplayedLots(filteredLots.slice(0, 8));
        setLoading(false);
      } catch (err) {
        console.error("Error processing auctions:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [showAuctions, showSoldLots]);

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && selectedLot?.biddingStarted) {
      handleStopAuction(selectedLot.id);
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [countdown, selectedLot]);

  const Card = ({ children, className }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:-translate-y-2 ${className || ''}`}>
      {children}
    </div>
  );

  const handleLotSelect = (lot) => {
    if (lot.sold) {
      // Check if payment is completed (assuming this info is available in the lot data)
      if (lot.paymentCompleted) {
        navigate(`/receipt/${lot.id}`);
      }
    } else {
      setSelectedLot(lot);
      setCountdown(null);
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
      setCountdown(20);
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

      const soldCount = displayedLots.filter(lot => lot.sold).length;
      const newDisplayedLots = [...displayedLots];

      // Update the sold status in displayedLots
      const lotIndex = newDisplayedLots.findIndex(lot => lot.id === lotId);
      if (lotIndex !== -1) {
        newDisplayedLots[lotIndex].sold = true;
      }

      // If 4 or more are sold, remove sold ones and add new ones
      if (soldCount >= 3) { // Accounting for the current one just sold making it 4
        const remainingLots = lots.filter(lot =>
          !newDisplayedLots.some(displayed => displayed.id === lot.id)
        );
        const activeDisplayed = newDisplayedLots.filter(lot => !lot.sold);
        const newLotsToAdd = remainingLots.slice(0, 8 - activeDisplayed.length);
        setDisplayedLots([...activeDisplayed, ...newLotsToAdd]);
      } else {
        setDisplayedLots(newDisplayedLots);
      }

      const currentIndex = displayedLots.findIndex(lot => lot.id === lotId);
      const nextAvailableLot = displayedLots.slice(currentIndex + 1).find(lot => !lot.sold) ||
        displayedLots.slice(0, currentIndex).find(lot => !lot.sold);

      setSelectedLot(nextAvailableLot || null);
      setCountdown(null);
    } catch (error) {
      console.error("Error stopping auction:", error);
    }
  };

  const handleSetBidValues = () => {
    if (selectedLot && !selectedLot.biddingStarted && !selectedLot.sold) {
      setSelectedLot({
        ...selectedLot,
        bidValue1: tempBidValues.bidValue1,
        bidValue2: tempBidValues.bidValue2
      });
    }
  };

  const toggleBidStatus = (status) => {
    setBidEnabled(status);
    try {
      const db = getFirestore();
      const configRef = doc(db, "appConfig", "auctionSettings");
      updateDoc(configRef, {
        biddingEnabled: status
      });
      console.log(`Bidding ${status ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error("Error updating bid status:", error);
    }
  };

  const toggleBuyStatus = (status) => {
    setBuyEnabled(status);
    // Update your database
    try {
      const db = getFirestore();
      const configRef = doc(db, "appConfig", "auctionSettings");
      updateDoc(configRef, {
        buyingEnabled: status
      });
      console.log(`Buying ${status ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error("Error updating buy status:", error);
    }
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

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button
          onClick={() => setShowAuctions(true)}
          className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
                   bg-gradient-to-r from-green-500 to-green-600 
                   transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-3xl mb-2">🚀</span>
          Start Auction
        </button> */}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button
          onClick={() => setShowAuctions(!showAuctions)}
          className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
             bg-gradient-to-r from-green-500 to-green-600 
             transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-3xl mb-2"></span>
          {showAuctions ? 'Close Auction Panel' : 'Start Auction'}
        </button>

        <div className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
             bg-gradient-to-r from-blue-500 to-blue-600">
          <span className="text-3xl mb-2">📦</span>
          <span>Bid Status: {bidEnabled ? 'Enabled' : 'Disabled'}</span>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => toggleBidStatus(true)}
              className={`px-3 py-1 rounded ${bidEnabled ? 'bg-blue-700' : 'bg-green-500 hover:bg-green-600'}`}
            >
              Open
            </button>
            <button
              onClick={() => toggleBidStatus(false)}
              className={`px-3 py-1 rounded ${!bidEnabled ? 'bg-blue-700' : 'bg-red-500 hover:bg-red-600'}`}
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 rounded-xl text-white font-semibold 
             bg-gradient-to-r from-purple-500 to-purple-600">
          <span className="text-3xl mb-2">💰</span>
          <span>Buy Status: {buyEnabled ? 'Enabled' : 'Disabled'}</span>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => toggleBuyStatus(true)}
              className={`px-3 py-1 rounded ${buyEnabled ? 'bg-purple-700' : 'bg-green-500 hover:bg-green-600'}`}
            >
              Open
            </button>
            <button
              onClick={() => toggleBuyStatus(false)}
              className={`px-3 py-1 rounded ${!buyEnabled ? 'bg-purple-700' : 'bg-red-500 hover:bg-red-600'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {/* </div> */}

      {showAuctions && (
        <div className="mt-8 w-full max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {showSoldLots ? 'Sold Auction Lots' : 'Available Auctions'}
            </h2>
            <button
              onClick={() => {
                setShowSoldLots(!showSoldLots);
                setSelectedLot(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showSoldLots ? 'Show Available Lots' : 'Show Sold Lots'}
            </button>
          </div>
          {loading ? (
            <div className="text-center py-4">Loading auctions...</div>
          ) : displayedLots.length === 0 ? (
            <div className="text-center py-4">
              {showSoldLots ? 'No sold auctions available' : 'No active auctions available'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {displayedLots.map((lot) => (
                  <div
                    key={lot.id}
                    className={`p-3 flex items-center justify-center text-white font-bold rounded-lg 
        ${showSoldLots ? 'bg-gray-700 cursor-pointer' : 'bg-green-900 cursor-pointer'}
        ${selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleLotSelect(lot)} // Updated to handle both sold and unsold lots
                  >
                    <div className="text-center">
                      <div className="text-xl">{lot.number}</div>
                      <div className="text-xs">{lot.auctionCenter}</div>
                      {showSoldLots && lot.soldAt && (
                        <div className="text-xs mt-1">
                          {new Date(lot.soldAt.seconds * 1000).toLocaleDateString()}
                        </div>
                      )}
                      {showSoldLots && lot.paymentCompleted && (
                        <div className="text-xs mt-1 text-green-300">Paid</div>
                      )}
                      {showSoldLots && !lot.paymentCompleted && (
                        <div className="text-xs mt-1 text-red-300">Unpaid</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedLot && !showSoldLots && (
                <div className="border border-gray-300 rounded-lg p-4 relative">
                  <h3 className="font-bold mb-2">Current Auction Lot</h3>
                  {countdown !== null && selectedLot?.biddingStarted && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
                      Time Remaining: {countdown}s
                    </div>
                  )}
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
                      <div className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bid Value 1:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={tempBidValues.bidValue1}
                              onChange={(e) => setTempBidValues({
                                ...tempBidValues,
                                bidValue1: e.target.value
                              })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                }
                              }}
                              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              disabled={selectedLot.biddingStarted || selectedLot.sold}
                              placeholder={selectedLot.bidValue1 || 'Enter value'}
                            />
                            <span className="text-gray-500">Current: {selectedLot.bidValue1 || 'Not set'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bid Value 2:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={tempBidValues.bidValue2}
                              onChange={(e) => setTempBidValues({
                                ...tempBidValues,
                                bidValue2: e.target.value
                              })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                }
                              }}
                              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              disabled={selectedLot.biddingStarted || selectedLot.sold}
                              placeholder={selectedLot.bidValue2 || 'Enter value'}
                            />
                            <span className="text-gray-500">Current: {selectedLot.bidValue2 || 'Not set'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={handleSetBidValues}
                          disabled={
                            selectedLot.biddingStarted ||
                            selectedLot.sold ||
                            (!tempBidValues.bidValue1 && !tempBidValues.bidValue2)
                          }
                        >
                          Set Bid Values
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <button
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={() => handleBid(selectedLot.id, selectedLot.bidValue1, selectedLot.bidValue2)}
                        disabled={
                          selectedLot.biddingStarted ||
                          selectedLot.sold ||
                          biddingStartedLots.has(selectedLot.id) ||
                          !selectedLot.bidValue1 ||
                          !selectedLot.bidValue2
                        }
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
          {['Dashboard', 'Aprovals', 'Auction', 'Lot Approval'].map((item) => (
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
          <button
            className="w-full text-left px-4 py-2 rounded-md transition-colors duration-200
              text-white border-none cursor-pointer bg-red-600 hover:bg-red-700 mt-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardPage;