import React, { useState, useEffect } from 'react';
import ProfilePopup from './ProfilePopup';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const BiddingPage = () => {
  const [selectedLot, setSelectedLot] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
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
          auctionAvg: auction.auctionAvg,
          minimum: auction.minimum,
          maximum: auction.maximum,
          auctioneer: auction.auctioneer,
          lotDetails: auction.lotDetails,
          biddingStarted: auction.biddingStarted || false,
          bidValue1: auction.bidValue1 || '',
          bidValue2: auction.bidValue2 || ''
        }));
        
        setAuctions(auctionData);
        setLots(lotsFromAuctions);
        
        if (selectedLot && lots.find(lot => lot.id === selectedLot.id)?.sold) {
          setSelectedLot(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error processing auctions:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [selectedLot]);

  const handleLotSelect = (lot) => {
    if (lot.sold || !lot.biddingStarted) return;
    setSelectedLot(lot);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/Home');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  return (
    <div className="w-full min-h-screen bg-white">
      <nav className="navigationbard">
        <ProfilePopup onLogout={handleLogout} />
      </nav>
      <div className="flex justify-center p-6">
        <div className="w-full max-w-3xl border border-gray-300 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Available Auctions</h2>
            {loading ? (
              <div className="text-center py-4">Loading auctions...</div>
            ) : lots.length === 0 ? (
              <div className="text-center py-4">No active auctions available</div>
            ) : (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {lots.map((lot) => (
                  <div 
                    key={lot.id}
                    className={`p-3 flex items-center justify-center text-white font-bold rounded-lg
                      ${lot.sold ? 'bg-red-800 opacity-60 cursor-not-allowed' : 
                        lot.biddingStarted ? 'bg-green-900 cursor-pointer' : 
                        'bg-gray-600 cursor-not-allowed'}
                      ${selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleLotSelect(lot)}
                  >
                    <div className="text-center">
                      <div className="text-xl">{lot.number}</div>
                      <div className="text-xs">{lot.auctionCenter}</div>
                    </div>
                    {lot.sold && <div className="absolute text-xs font-normal">SOLD</div>}
                    {!lot.biddingStarted && !lot.sold && <div className="absolute text-xs font-normal">NOT STARTED</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg p-4 h-auto">
                <h3 className="font-bold mb-2">Current Bid Lot</h3>
                {selectedLot ? (
                  <div className="mt-2">
                    <p><span className="font-semibold">Auction No:</span> {selectedLot.number}</p>
                    <p><span className="font-semibold">Center:</span> {selectedLot.auctionCenter}</p>
                    <p><span className="font-semibold">Auctioneer:</span> {selectedLot.auctioneer || "Not specified"}</p>
                    <p><span className="font-semibold">Quantity:</span> {selectedLot.totalQuantity} Kg</p>
                    {selectedLot.lotDetails && (
                      <>
                        <p><span className="font-semibold">Lot Number:</span> {selectedLot.lotDetails.lotNumber}</p>
                        <p><span className="font-semibold">Seller:</span> {selectedLot.lotDetails.sellerName}</p>
                        <p><span className="font-semibold">Grade:</span> {selectedLot.lotDetails.grade}</p>
                      </>
                    )}
                    <p><span className="font-semibold">Minimum Price:</span> ₹{parseInt(selectedLot.minimum || 0).toLocaleString()}</p>
                    <p><span className="font-semibold">Maximum Price:</span> ₹{parseInt(selectedLot.maximum || 0).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 mt-4">Please select an active auction</p>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg p-4 h-auto mb-4">
                <h3 className="font-bold mb-2">Bidded Price</h3>
                {selectedLot ? (
                  <PriceEntryForm 
                    onBuyNow={(amount) => {
                      alert(`Bid of ₹${amount} submitted for Lot ${selectedLot.number}`);
                    }}
                    minimumPrice={parseInt(selectedLot.minimum || 0)}
                    maximumPrice={parseInt(selectedLot.maximum || 0)}
                    bidValue1={selectedLot.bidValue1}
                    bidValue2={selectedLot.bidValue2}
                  />
                ) : (
                  <p className="text-center text-gray-500 mt-4">Select an active auction to bid</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriceEntryForm = ({ onBuyNow, minimumPrice = 0, maximumPrice = 0, bidValue1 = '', bidValue2 = '' }) => {
  const [totalPrice, setTotalPrice] = useState(minimumPrice);

  const handleBidClick = (value) => {
    if (value && !isNaN(parseInt(value))) {
      const increment = parseInt(value);
      setTotalPrice(prevTotal => {
        const newTotal = prevTotal + increment;
        return newTotal <= maximumPrice ? newTotal : maximumPrice;
      });
    }
  };

  const handleReset = () => {
    setTotalPrice(minimumPrice);
  };

  const handleBuyNowClick = () => {
    onBuyNow(totalPrice);
  };

  const isMaxReached = totalPrice >= maximumPrice;

  const avgPrice = (minimumPrice + maximumPrice) / 2;

  // Data to create a zigzag pattern similar to the provided graph
  const winningChanceData = [
    { value: 0 },
    { value: 5 },
    { value: 3 },
    { value: 8 },
    { value: 6 },
    { value: 10 },
    { value: 8 },
    { value: 12 },
    { value: 10 },
    { value: 15 },
  ];

  return (
    <div className="bg-white p-3 rounded-lg">
      <div className="mb-2">
        <div className="text-sm text-gray-600">Current Price:</div>
        <div className="text-lg font-bold text-green-800">₹{minimumPrice.toLocaleString()}</div>
      </div>
      <div className="mb-3">
        <div className="text-sm text-gray-600">Entered Price:</div>
        <div className="text-lg font-bold text-green-800">₹{totalPrice.toLocaleString()}</div>
      </div>
      {totalPrice > avgPrice && (
        <div className="mb-3 relative">
          <div className="text-sm text-gray-600">Winning Chance:</div>
          <div style={{ height: "50px" }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={winningChanceData}>
                <Line 
                  type="linear"
                  dataKey="value" 
                  stroke="#00B894" 
                  strokeWidth={4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Custom arrow at the end of the line */}
            <div className="absolute top-0 right-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 12L12 6L0 0L0 12Z" fill="#00B894"/>
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleBidClick(bidValue1)}
          className={`flex-1 p-2 rounded-lg text-center transition-colors
            bg-gray-100 hover:bg-gray-200 text-lg font-bold
            ${(!bidValue1 || isNaN(parseInt(bidValue1)) || isMaxReached) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!bidValue1 || isNaN(parseInt(bidValue1)) || isMaxReached}
        >
          +{bidValue1 || 'N/A'}
        </button>
        <button
          onClick={() => handleBidClick(bidValue2)}
          className={`flex-1 p-2 rounded-lg text-center transition-colors
            bg-gray-100 hover:bg-gray-200 text-lg font-bold
            ${(!bidValue2 || isNaN(parseInt(bidValue2)) || isMaxReached) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!bidValue2 || isNaN(parseInt(bidValue2)) || isMaxReached}
        >
          +{bidValue2 || 'N/A'}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleBuyNowClick}
          className="flex-1 bg-green-800 text-white p-2 rounded-lg hover:bg-green-900 transition-colors"
        >
          BID NOW
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          RESET
        </button>
      </div>
    </div>
  );
};

export default BiddingPage;