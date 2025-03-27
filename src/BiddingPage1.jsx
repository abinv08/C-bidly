import React, { useState, useEffect } from 'react';

import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const BiddingPage1 = () => {
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
          });
        });
        
        const lotsFromAuctions = auctionData.map((auction, index) => ({
          id: auction.id,
          number: auction.auctionNo || `A${index + 1}`,
          color: 'green',
          sold: false,
          auctionCenter: auction.auctionCenter,
          totalQuantity: auction.totalQuantity,
          auctionAvg: auction.auctionAvg,
          minimum: auction.minimum,
          maximum: auction.maximum,
          auctioneer: auction.auctioneer,
          lotDetails: auction.lotDetails
        }));
        
        setAuctions(auctionData);
        setLots(lotsFromAuctions);
        setLoading(false);
      } catch (err) {
        console.error("Error processing auctions:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLotSelect = (lot) => {
    if (lot.sold) return;
    setSelectedLot(lot);
  };


  return (
    <div className="w-full min-h-screen bg-white">
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
                      ${lot.sold ? 'bg-red-800 opacity-60 cursor-not-allowed' : 'bg-green-900 cursor-pointer'}
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
                  <p className="text-center text-gray-500 mt-4">Please select an auction</p>
                )}
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingPage1;