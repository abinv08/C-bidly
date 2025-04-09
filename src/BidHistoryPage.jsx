import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const BidHistoryPage = () => {
  const { lotId } = useParams();
  const [bidHistory, setBidHistory] = useState([]);
  const [lotDetails, setLotDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (!lotId) {
      setLoading(false);
      return;
    }

    const fetchLotDetails = async () => {
      try {
        const db = getFirestore();
        const lotDocRef = doc(db, "auctionlotpub", lotId);
        const lotDocSnap = await getDoc(lotDocRef);
        
        if (lotDocSnap.exists()) {
          const data = lotDocSnap.data();
          setLotDetails({
            id: lotDocSnap.id,
            number: data.auctionNo || "Unknown",
            auctionCenter: data.auctionCenter || "Unknown",
            totalQuantity: data.totalQuantity || 0,
            minimum: data.minimum || 0,
            maximum: data.maximum || 0,
            sold: data.sold || false,
            auctioneer: data.auctioneer || "Unknown",
            lotDetails: data.lotDetails || {}
          });
        } else {
          console.log("No such lot!");
        }
      } catch (error) {
        console.error("Error fetching lot details:", error);
      }
    };

    fetchLotDetails();

    const db = getFirestore();
    const bidsCollection = collection(db, "aubidprice");
    const q = query(
      bidsCollection, 
      where("lotId", "==", lotId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const bids = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          bids.push({
            id: doc.id,
            bidAmount: data.bidAmount,
            userId: data.userId,
            userEmail: data.userEmail,
            timestamp: data.timestamp?.toDate?.() || new Date(),
            isCurrentUser: data.userId === auth.currentUser?.uid
          });
        });
        setBidHistory(bids);
        setLoading(false);
      } catch (error) {
        console.error("Error processing bids:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [lotId, auth.currentUser?.uid]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };

  const renderUserEmail = (email) => {
    if (email === auth.currentUser?.email) {
      return <span className="font-bold text-blue-600">You</span>;
    }
    
    // Mask email for privacy
    const parts = email.split('@');
    if (parts.length === 2) {
      let username = parts[0];
      if (username.length > 3) {
        username = username.substring(0, 3) + '***';
      }
      return username + '@' + parts[1];
    }
    return email;
  };

  return (
    <div className="w-full min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bid History</h1>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Auctions
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading bid history...</p>
          </div>
        ) : (
          <>
            {lotDetails && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Lot Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><span className="font-medium">Auction No:</span> {lotDetails.number}</div>
                  <div><span className="font-medium">Center:</span> {lotDetails.auctionCenter}</div>
                  <div><span className="font-medium">Quantity:</span> {lotDetails.totalQuantity} Kg</div>
                  <div><span className="font-medium">Minimum Price:</span> ₹{parseInt(lotDetails.minimum).toLocaleString()}</div>
                  <div><span className="font-medium">Maximum Price:</span> ₹{parseInt(lotDetails.maximum).toLocaleString()}</div>
                  <div><span className="font-medium">Status:</span> {lotDetails.sold ? 'Sold' : 'Active'}</div>
                  {lotDetails.lotDetails && (
                    <>
                      <div><span className="font-medium">Seller:</span> {lotDetails.lotDetails.sellerName || lotDetails.auctioneer}</div>
                      <div><span className="font-medium">Grade:</span> {lotDetails.lotDetails.grade || "Not specified"}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-300">
              <h2 className="text-xl font-bold p-4 border-b">Bid History</h2>
              {bidHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No bids have been placed for this lot yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bidHistory.map((bid, index) => (
                        <tr key={bid.id} className={bid.isCurrentUser ? "bg-blue-50" : (index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {renderUserEmail(bid.userEmail)}
                            {index === 0 && lotDetails?.sold && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Winner</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ₹{parseInt(bid.bidAmount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimestamp(bid.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BidHistoryPage;