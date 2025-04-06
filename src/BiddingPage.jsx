import React, { useState, useEffect } from 'react';
import ProfilePopup from './ProfilePopup';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { signOut, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const BiddingPage = () => {
  const [selectedLot, setSelectedLot] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [biddedLots, setBiddedLots] = useState(new Set());
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentLot, setPaymentLot] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winningBid, setWinningBid] = useState(null);
  const [highestBids, setHighestBids] = useState({});
  const [showSoldLots, setShowSoldLots] = useState(false);
  const [showWinNotification, setShowWinNotification] = useState(false);
  const [wonLotInfo, setWonLotInfo] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Track previously sold lots to detect newly sold lots
  const [previousSoldLots, setPreviousSoldLots] = useState(new Set());

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
            bidValue2: data.bidValue2 || '',
            paymentCompleted: data.paymentCompleted || false
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
          bidValue2: auction.bidValue2 || '',
          paymentCompleted: auction.paymentCompleted || false
        }));

        setAuctions(auctionData);

        const currentSoldLotIds = new Set(lotsFromAuctions.filter(lot => lot.sold).map(lot => lot.id));
        const newlySoldLots = lotsFromAuctions.filter(lot =>
          lot.sold &&
          !previousSoldLots.has(lot.id) &&
          highestBids[lot.id]?.userId === currentUserId
        );

        if (newlySoldLots.length > 0) {
          const wonLot = newlySoldLots[0];
          setWonLotInfo(wonLot);
          setShowWinNotification(true);
          fetchWinningBid(wonLot.id);
        }

        setPreviousSoldLots(currentSoldLotIds);
        setLots(lotsFromAuctions);

        if (selectedLot) {
          const updatedLot = lotsFromAuctions.find(lot => lot.id === selectedLot.id);
          if (updatedLot) {
            if (updatedLot.sold && !selectedLot.sold) {
              fetchWinningBid(selectedLot.id);
              setSelectedLot(updatedLot);
            } else {
              setSelectedLot(updatedLot);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error processing auctions:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [selectedLot, highestBids, previousSoldLots, currentUserId]);

  useEffect(() => {
    const db = getFirestore();
    const bidsCollection = collection(db, "aubidprice");

    const unsubscribe = onSnapshot(
      query(bidsCollection, orderBy("timestamp", "desc")),
      (snapshot) => {
        const latestBids = {};
        snapshot.forEach((doc) => {
          const bid = doc.data();
          if (!latestBids[bid.lotId] || bid.bidAmount > latestBids[bid.lotId].amount) {
            latestBids[bid.lotId] = {
              amount: bid.bidAmount,
              userId: bid.userId,
              userEmail: bid.userEmail
            };
          }
        });
        setHighestBids(latestBids);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchWinningBid = async (lotId) => {
    try {
      const db = getFirestore();
      const bidsCollection = collection(db, "aubidprice");
      const q = query(bidsCollection, where("lotId", "==", lotId), orderBy("bidAmount", "desc"), orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const winningBidDoc = querySnapshot.docs[0];
        const winningBidData = { id: winningBidDoc.id, ...winningBidDoc.data() };
        setWinningBid(winningBidData);
      }
    } catch (error) {
      console.error("Error fetching winning bid:", error);
    }
  };

  const handleLotSelect = (lot) => {
    if (highestBids[lot.id]?.userId === auth.currentUser.uid || (lot.biddingStarted && !lot.sold)) {
      setSelectedLot(lot);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/LoginForm');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleBidSubmit = async (lotId, amount) => {
    try {
      const db = getFirestore();
      const bidData = {
        lotId,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        bidAmount: amount,
        timestamp: new Date()
      };

      await addDoc(collection(db, "aubidprice"), bidData);
      setBiddedLots(prev => new Set(prev).add(lotId));
      alert("Your bid has been successfully recorded!");
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert("Failed to submit bid. Please try again.");
    }
  };

  const handlePayClick = (lot) => {
    try {
      const highestBid = highestBids[lot.id]?.amount || lot.minimum;
      const completeLot = auctions.find(auction => auction.id === lot.id);

      if (completeLot) {
        setPaymentLot({
          ...completeLot,
          bidAmount: highestBid,
          number: completeLot.auctionNo || lot.number,
          auctionCenter: completeLot.auctionCenter,
          totalQuantity: completeLot.totalQuantity,
          auctioneer: completeLot.auctioneer || lot.auctioneer,
          minimum: completeLot.minimum,
          maximum: completeLot.maximum,
          lotDetails: {
            lotNumber: completeLot.lotNumber || completeLot.auctionNo,
            grade: completeLot.lotDetails?.grade || completeLot.grade || "Not specified",
            sellerName: completeLot.lotDetails?.sellerName || completeLot.auctioneer || lot.auctioneer || "Not specified"
          }
        });
      } else {
        setPaymentLot({
          ...lot,
          bidAmount: highestBid,
          auctioneer: lot.auctioneer,
          lotDetails: {
            lotNumber: lot.lotNumber || lot.number,
            grade: lot.lotDetails?.grade || lot.grade || "Not specified",
            sellerName: lot.lotDetails?.sellerName || lot.auctioneer || "Not specified"
          }
        });
      }
      setShowPaymentPopup(true);
    } catch (error) {
      console.error("Error preparing payment details:", error);
      alert("Error loading payment details. Please try again.");
    }
  };

  const handlePaymentProcess = (lot) => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => initializeRazorpay(lot);
      document.body.appendChild(script);
    } else {
      initializeRazorpay(lot);
    }
  };

  const initializeRazorpay = (lot) => {
    const options = {
      key: "rzp_test_uNUuy6E1JJPmL5",
      amount: parseInt(lot.bidAmount) * 100,
      currency: "INR",
      name: "Auction Purchase",
      description: `Payment for Lot ${lot.number || lot.auctionNo}`,
      image: "your-logo-url.png",
      handler: function (response) {
        processSuccessfulPayment(response, lot);
      },
      prefill: {
        email: auth.currentUser.email,
      },
      theme: {
        color: "#3399cc"
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  const processSuccessfulPayment = async (response, lot) => {
    try {
      const db = getFirestore();
      const tokenNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit token

      // Save payment details to Firestore
      const paymentRef = await addDoc(collection(db, "payments"), {
        lotId: lot.id,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount: lot.bidAmount,
        paymentId: response.razorpay_payment_id,
        timestamp: new Date(),
        tokenNumber: tokenNumber,
        lotDetails: {
          auctionNo: lot.number || lot.auctionNo,
          center: lot.auctionCenter,
          quantity: lot.totalQuantity,
          seller: lot.lotDetails?.sellerName || lot.auctioneer,
          grade: lot.lotDetails?.grade || lot.grade || "Not specified"
        }
      });

      // Update the auction lot to mark payment as completed
      const lotDocRef = doc(db, "auctionlotpub", lot.id);
      await updateDoc(lotDocRef, {
        paymentCompleted: true,
        paymentTimestamp: new Date(),
        paymentId: paymentRef.id,
        tokenNumber: tokenNumber
      });

      // Update local state to reflect payment completion immediately
      setLots(prevLots =>
        prevLots.map(l =>
          l.id === lot.id ? { ...l, paymentCompleted: true } : l
        )
      );
      if (selectedLot?.id === lot.id) {
        setSelectedLot({ ...selectedLot, paymentCompleted: true });
      }

      // Close payment popup
      setShowPaymentPopup(false);

      // Show receipt
      setReceiptData({
        tokenNumber: tokenNumber,
        paymentId: response.razorpay_payment_id,
        timestamp: new Date(),
        auctionNo: lot.number || lot.auctionNo,
        center: lot.auctionCenter,
        quantity: lot.totalQuantity,
        seller: lot.lotDetails?.sellerName || lot.auctioneer,
        grade: lot.lotDetails?.grade || lot.grade || "Not specified",
        amount: lot.bidAmount
      });
      setShowReceipt(true);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment was successful, but failed to update in our system. Please note your payment ID: " + response.razorpay_payment_id + " and contact support.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <nav className="navigationbard">
        <ProfilePopup onLogout={handleLogout} />
      </nav>

      {/* Win Notification */}
      {showWinNotification && wonLotInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="mb-4">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-green-700">Congratulations!</h2>
              <p className="text-xl mt-2">You won the auction for lot #{wonLotInfo.number}!</p>
              <p className="mt-4">Your bid of ₹{highestBids[wonLotInfo.id]?.amount.toLocaleString()} was the highest.</p>
              <p className="mt-2">Please proceed to payment to complete your purchase.</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWinNotification(false);
                  handlePaymentProcess(wonLotInfo);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Pay Now
              </button>
              <button
                onClick={() => setShowWinNotification(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center p-6">
        <div className="w-full max-w-3xl border border-gray-300 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showSoldLots ? 'Sold Auctions' : 'Available Auctions'}
              </h2>
              <button
                onClick={() => setShowSoldLots(!showSoldLots)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showSoldLots ? 'Show Available Lots' : 'Show Sold Lots'}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading auctions...</div>
            ) : lots.length === 0 ? (
              <div className="text-center py-4">No {showSoldLots ? 'sold' : 'active'} auctions available</div>
            ) : (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {lots.filter(lot => {
                  if (showSoldLots) {
                    return lot.sold;
                  } else {
                    return !lot.sold || highestBids[lot.id]?.userId === auth.currentUser.uid;
                  }
                }).map((lot) => (
                  <div key={lot.id} className="relative">
                    <div
                      className={`p-3 flex items-center justify-center text-white font-bold rounded-lg
                        ${lot.sold && highestBids[lot.id]?.userId === auth.currentUser.uid ? 'bg-blue-600' :
                          lot.sold ? 'bg-red-800 opacity-60' :
                            lot.biddingStarted ? 'bg-green-900' :
                              'bg-gray-600'}
                        ${selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''}
                        ${(highestBids[lot.id]?.userId === auth.currentUser.uid) ? 'cursor-pointer' :
                          (!lot.biddingStarted && lot.sold) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (highestBids[lot.id]?.userId === auth.currentUser.uid || (lot.biddingStarted && !lot.sold)) {
                          handleLotSelect(lot);
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className="text-xl">{lot.number}</div>
                        <div className="text-xs">{lot.auctionCenter}</div>
                      </div>
                      {lot.sold && highestBids[lot.id]?.userId === auth.currentUser.uid &&
                        <div className="absolute text-xs font-normal">WON</div>
                      }
                      {lot.sold && highestBids[lot.id]?.userId !== auth.currentUser.uid &&
                        <div className="absolute text-xs font-normal">SOLD</div>
                      }
                      {!lot.biddingStarted && !lot.sold &&
                        <div className="absolute text-xs font-normal">NOT STARTED</div>
                      }
                    </div>
                    {lot.sold && highestBids[lot.id]?.userId === auth.currentUser.uid && !lot.paymentCompleted && (
                      <button
                        onClick={() => handlePayClick(lot)}
                        className="absolute -right-2 -top-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-700"
                      >
                        Pay
                      </button>
                    )}
                    {lot.sold && highestBids[lot.id]?.userId === auth.currentUser.uid && lot.paymentCompleted && (
                      <div className="absolute -right-2 -top-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        Paid
                      </div>
                    )}
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
                    <p className="mt-2">
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={`font-bold ${selectedLot.sold ? 'text-red-600' : selectedLot.biddingStarted ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedLot.sold ? 'Auction Ended' : selectedLot.biddingStarted ? 'Bidding Active' : 'Not Started'}
                      </span>
                    </p>
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
                  selectedLot.sold ? (
                    <div className="text-center p-4">
                      <p className="text-xl font-bold text-red-600">Auction has ended</p>
                      {highestBids[selectedLot.id]?.userId === auth.currentUser.uid ? (
                        <>
                          <p className="text-green-600 font-bold mt-2">Congratulations! You won this auction.</p>
                          {!selectedLot.paymentCompleted && (
                            <button
                              onClick={() => handlePayClick(selectedLot)}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Pay Now
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-600 mt-2">The auction has been completed.</p>
                      )}
                    </div>
                  ) : !selectedLot.biddingStarted ? (
                    <p className="text-center text-gray-500 mt-4">Bidding has not started yet</p>
                  ) : (
                    <PriceEntryForm
                      onBuyNow={(amount) => handleBidSubmit(selectedLot.id, amount)}
                      minimumPrice={parseInt(selectedLot.minimum || 0)}
                      maximumPrice={parseInt(selectedLot.maximum || 0)}
                      bidValue1={selectedLot.bidValue1}
                      bidValue2={selectedLot.bidValue2}
                      selectedLot={selectedLot}
                    />
                  )
                ) : (
                  <p className="text-center text-gray-500 mt-4">Select an active auction to bid</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && paymentLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={() => setShowPaymentPopup(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Auction No:</span> {paymentLot.number || paymentLot.auctionNo}</p>
              <p><span className="font-semibold">Center:</span> {paymentLot.auctionCenter}</p>
              <p><span className="font-semibold">Seller Name:</span> {paymentLot.lotDetails?.sellerName || paymentLot.auctioneer}</p>
              <p><span className="font-semibold">Quantity:</span> {paymentLot.totalQuantity} Kg</p>
              <p><span className="font-semibold">Lot Number:</span> {paymentLot.lotDetails?.lotNumber || paymentLot.lotNumber || paymentLot.number}</p>
              <p><span className="font-semibold">Grade:</span> {paymentLot.lotDetails?.grade || paymentLot.grade || "Not specified"}</p>
              <p><span className="font-semibold">Base Price:</span> ₹{parseInt(paymentLot.minimum || 0).toLocaleString()}</p>
              <p><span className="font-semibold">Maximum Price:</span> ₹{parseInt(paymentLot.maximum || 0).toLocaleString()}</p>
              <p><span className="font-semibold">Winning Bid Amount:</span> ₹{parseInt(paymentLot.bidAmount).toLocaleString()}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handlePaymentProcess(paymentLot);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Popup */}
      {showWinnerPopup && winningBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Auction Winner</h2>
              <button onClick={() => setShowWinnerPopup(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Winner:</span> {winningBid.userEmail}</p>
              <p><span className="font-semibold">Winning Bid:</span> ₹{parseInt(winningBid.bidAmount).toLocaleString()}</p>
              <p><span className="font-semibold">Time:</span> {winningBid.timestamp.toLocaleString()}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowWinnerPopup(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center mb-4 border-b-2 border-gray-200 pb-4">
              <h2 className="text-2xl font-bold">Payment Receipt</h2>
              <p className="text-green-600 font-bold">Payment Successful</p>
            </div>
            <div className="text-center mb-4">
              <div className="text-xl font-bold">Token Number: {receiptData.tokenNumber}</div>
              <div className="text-sm text-gray-600">Keep this number for reference</div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="grid grid-cols-2">
                <p className="font-semibold">Date:</p>
                <p>{receiptData.timestamp.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Payment ID:</p>
                <p className="break-words">{receiptData.paymentId}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Auction No:</p>
                <p>{receiptData.auctionNo}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Center:</p>
                <p>{receiptData.center}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Quantity:</p>
                <p>{receiptData.quantity} Kg</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Seller:</p>
                <p>{receiptData.seller}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Grade:</p>
                <p>{receiptData.grade}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-semibold">Amount Paid:</p>
                <p className="font-bold">₹{parseInt(receiptData.amount).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowReceipt(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceEntryForm = ({ onBuyNow, minimumPrice = 0, maximumPrice = 0, bidValue1 = '', bidValue2 = '', selectedLot }) => {
  const [totalPrice, setTotalPrice] = useState(minimumPrice);
  const auth = getAuth();
  const [currentHighestBid, setCurrentHighestBid] = useState(minimumPrice);

  useEffect(() => {
    if (!selectedLot?.id) return;

    const db = getFirestore();
    const bidsCollection = collection(db, "aubidprice");

    const unsubscribe = onSnapshot(
      query(bidsCollection, where("lotId", "==", selectedLot.id), orderBy("bidAmount", "desc"), orderBy("timestamp", "asc")),
      (snapshot) => {
        if (!snapshot.empty) {
          const highestBid = snapshot.docs[0].data().bidAmount;
          setCurrentHighestBid(highestBid);
          setTotalPrice(prev => Math.max(prev, highestBid));
        }
      }
    );

    return () => unsubscribe();
  }, [selectedLot]);

  const handleBidClick = (value) => {
    if (value && !isNaN(parseInt(value))) {
      const increment = parseInt(value);
      setTotalPrice(prevTotal => {
        const newTotal = Math.max(currentHighestBid + increment, prevTotal + increment);
        return newTotal <= maximumPrice ? newTotal : maximumPrice;
      });
    }
  };

  const handleReset = () => {
    setTotalPrice(Math.max(minimumPrice, currentHighestBid));
  };

  const handleBuyNowClick = () => {
    if (totalPrice > currentHighestBid) {
      onBuyNow(totalPrice);
    } else {
      alert("Your bid must be higher than the current highest bid");
    }
  };

  const isMaxReached = totalPrice >= maximumPrice;

  const avgPrice = (minimumPrice + maximumPrice) / 2;

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
        <div className="text-sm text-gray-600">Started Price:</div>
        <div className="text-lg font-bold text-green-800">₹{minimumPrice.toLocaleString()}</div>
      </div>
      <div className="mb-2">
        <div className="text-sm text-gray-600">Current Highest Bid:</div>
        <div className="text-lg font-bold text-green-800">₹{currentHighestBid.toLocaleString()}</div>
      </div>
      <div className="mb-3">
        <div className="text-sm text-gray-600">Your Bid Amount:</div>
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
            <div className="absolute top-0 right-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 12L12 6L0 0L0 12Z" fill="#00B894" />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="mb-2">
        <div className="text-sm text-gray-600 mb-1">Prefixed Bid Values:</div>
      </div>
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