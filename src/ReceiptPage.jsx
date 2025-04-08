import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import PaymentReceipt from './PaymentReceipt';

const ReceiptPage = () => {
  const { lotId } = useParams();
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  
  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        if (!lotId) {
          setLoading(false);
          return;
        }
        
        const db = getFirestore();
        const paymentsRef = collection(db, "payments");
        const q = query(
          paymentsRef, 
          where("lotId", "==", lotId),
          where("userId", "==", auth.currentUser?.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const paymentDoc = querySnapshot.docs[0];
          const paymentData = paymentDoc.data();
          
          setReceiptData({
            tokenNumber: paymentData.tokenNumber,
            paymentId: paymentData.paymentId,
            timestamp: paymentData.timestamp.toDate(),
            auctionNo: paymentData.lotDetails.auctionNo,
            center: paymentData.lotDetails.center,
            quantity: paymentData.lotDetails.quantity,
            seller: paymentData.lotDetails.seller,
            grade: paymentData.lotDetails.grade,
            amount: paymentData.amount
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
        setLoading(false);
      }
    };
    
    fetchReceiptData();
  }, [lotId, auth.currentUser]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };
  
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p>Loading receipt data...</p>
      </div>
    );
  }
  
  if (!receiptData) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Receipt not found</p>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <PaymentReceipt 
          receiptData={receiptData} 
          onClose={handleClose} 
          onPrint={handlePrint} 
        />
      </div>
    </div>
  );
};

export default ReceiptPage;