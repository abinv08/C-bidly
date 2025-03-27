import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, updateDoc, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth } from './Firebase'; // Adjust path as needed

const LotApproval = () => {
  const [pendingLots, setPendingLots] = useState([]);
  const [approvedLots, setApprovedLots] = useState([]);
  const [rejectedLots, setRejectedLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [lastLotNumber, setLastLotNumber] = useState(0);

  useEffect(() => {
    // Set up real-time listeners
    const db = getFirestore();
    
    // Listen for all sellers
    const sellersRef = collection(db, 'sellers');
    const unsubscribe = onSnapshot(sellersRef, (snapshot) => {
      const pending = [];
      const approved = [];
      const rejected = [];
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        
        if (data.approvalStatus === 'pending') {
          pending.push(data);
        } else if (data.approvalStatus === 'approved') {
          approved.push(data);
        } else if (data.approvalStatus === 'rejected') {
          rejected.push(data);
        }
      });
      
      setPendingLots(pending);
      setApprovedLots(approved);
      setRejectedLots(rejected);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to sellers collection:", error);
      setLoading(false);
    });
    
    // Listen for the highest lot number
    const lotNumberQuery = query(sellersRef, where("lotNumber", "!=", null));
    const lotNumberUnsubscribe = onSnapshot(lotNumberQuery, (snapshot) => {
      let maxLotNumber = 0;
      snapshot.forEach((doc) => {
        const lotNumber = doc.data().lotNumber || 0;
        maxLotNumber = Math.max(maxLotNumber, lotNumber);
      });
      
      setLastLotNumber(maxLotNumber);
    }, (error) => {
      console.error("Error listening to lot numbers:", error);
    });
    
    // Clean up listeners when component unmounts
    return () => {
      unsubscribe();
      lotNumberUnsubscribe();
    };
  }, []);

  const handleApprove = async (lotId) => {
    try {
      const db = getFirestore();
      const sellerRef = doc(db, 'sellers', lotId);
      
      const newLotNumber = lastLotNumber + 1;
      
      await updateDoc(sellerRef, {
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString(),
        lotNumber: newLotNumber,
        firstApproval: true
      });
      
      alert("First approval completed successfully! Lot number assigned: " + newLotNumber);
    } catch (error) {
      console.error("Error approving seller:", error);
      alert("Failed to approve seller.");
    }
  };

  const handleFinalApprove = async (lotId) => {
    try {
      const db = getFirestore();
      const sellerRef = doc(db, 'sellers', lotId);
      
      await updateDoc(sellerRef, {
        secondApproval: true,
        finalApprovedAt: new Date().toISOString()
      });
      
      alert("Final approval completed successfully!");
    } catch (error) {
      console.error("Error giving final approval:", error);
      alert("Failed to give final approval.");
    }
  };

  const handleReject = async (lotId) => {
    try {
      const db = getFirestore();
      const sellerRef = doc(db, 'sellers', lotId);
      
      await updateDoc(sellerRef, {
        approvalStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        lotNumber: null,
        firstApproval: false,
        secondApproval: false
      });
      
      alert("Seller rejected successfully!");
    } catch (error) {
      console.error("Error rejecting seller:", error);
      alert("Failed to reject seller.");
    }
  };

  const handleRejectFinal = async (lotId) => {
    try {
      const db = getFirestore();
      const sellerRef = doc(db, 'sellers', lotId);
      
      await updateDoc(sellerRef, {
        approvalStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        firstApproval: false,
        secondApproval: false
      });
      
      alert("Lot rejected successfully!");
    } catch (error) {
      console.error("Error rejecting lot:", error);
      alert("Failed to reject lot.");
    }
  };

  const handleAddToAuction = async (lot) => {
    try {
      const db = getFirestore();
      
      // Generate a unique auction number with date prefix
      const today = new Date();
      const auctionNoPrefix = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
      const auctionNo = `${auctionNoPrefix}-${lot.lotNumber}`;
      
      // Create a new auction document in the auctions collection
      const auctionData = {
        auctionNo: auctionNo,
        auctionCenter: lot.center || 'Main Center',
        totalQuantity: lot.totalQuantity,
        totalLots: 1,
        lotsSold: 0,
        minimum: 0,
        maximum: 0,
        auctionAvg: 0,
        status: 'pending',
        createdAt: new Date(),
        lotDetails: {
          lotNumber: lot.lotNumber,
          sellerName: lot.sellerName || lot.name,
          grade: lot.grade || 'Not specified', // Explicitly include grade
          numberOfBags: lot.numberOfBags,
          bagSize: lot.bagSize,
          totalQuantity: lot.totalQuantity,
          sellerId: lot.id
        },
        totalParticipates: 0
      };
      
      await addDoc(collection(db, 'cardamomAuctions'), auctionData);
      
      // Update the seller document to mark it as added to auction
      const sellerRef = doc(db, 'sellers', lot.id);
      await updateDoc(sellerRef, {
        addedToAuction: true,
        auctionAddedAt: new Date().toISOString(),
        auctionNo: auctionNo
      });
      
      alert(`Successfully added to auction! Auction number: ${auctionNo}`);
    } catch (error) {
      console.error("Error adding to auction:", error);
      alert("Failed to add to auction.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lot Approval Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingLots.length})
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'approved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedLots.length})
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({rejectedLots.length})
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeTab === 'pending' && pendingLots.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No pending lots found</td>
              </tr>
            )}
            
            {activeTab === 'pending' && pendingLots.map((lot) => (
              <tr key={lot.id}>
                <td className="px-6 py-4 whitespace-nowrap">-</td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.sellerName || lot.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.grade || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lot.totalQuantity ? `${lot.totalQuantity} kg` : 'N/A'} 
                  {lot.numberOfBags && lot.bagSize ? ` (${lot.numberOfBags} bags × ${lot.bagSize} kg)` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.createdAt ? new Date(lot.createdAt).toLocaleString() : 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleApprove(lot.id)}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(lot.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            
            {activeTab === 'approved' && approvedLots.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No approved lots found</td>
              </tr>
            )}
            
            {activeTab === 'approved' && approvedLots.map((lot) => (
              <tr key={lot.id} className={lot.addedToAuction ? "bg-purple-50" : "bg-green-50"}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">#{lot.lotNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.sellerName || lot.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.grade || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lot.totalQuantity ? `${lot.totalQuantity} kg` : 'N/A'} 
                  {lot.numberOfBags && lot.bagSize ? ` (${lot.numberOfBags} bags × ${lot.bagSize} kg)` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.createdAt ? new Date(lot.createdAt).toLocaleString() : 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      First Approval on {lot.approvedAt ? new Date(lot.approvedAt).toLocaleString() : 'unknown date'}
                    </span>
                    {!lot.secondApproval ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleFinalApprove(lot.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                        >
                          Give Second Approval
                        </button>
                        <button 
                          onClick={() => handleRejectFinal(lot.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Second Approval on {lot.finalApprovedAt ? new Date(lot.finalApprovedAt).toLocaleString() : 'unknown date'}
                        </span>
                        {!lot.addedToAuction && (
                          <button 
                            onClick={() => handleAddToAuction(lot)}
                            className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded"
                          >
                            Add to Auction
                          </button>
                        )}
                        {lot.addedToAuction && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Added to Auction ({lot.auctionNo || 'Auction'})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {activeTab === 'rejected' && rejectedLots.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No rejected lots found</td>
              </tr>
            )}
            
            {activeTab === 'rejected' && rejectedLots.map((lot) => (
              <tr key={lot.id} className="bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap">{lot.lotNumber ? `#${lot.lotNumber}` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.sellerName || lot.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.grade || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lot.totalQuantity ? `${lot.totalQuantity} kg` : 'N/A'} 
                  {lot.numberOfBags && lot.bagSize ? ` (${lot.numberOfBags} bags × ${lot.bagSize} kg)` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{lot.createdAt ? new Date(lot.createdAt).toLocaleString() : 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Rejected on {lot.rejectedAt ? new Date(lot.rejectedAt).toLocaleString() : 'unknown date'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LotApproval;