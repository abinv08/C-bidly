import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { auth } from './Firebase'; // Make sure signOut is imported
import ProfilePopup from './ProfilePopup';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AuctionLotAdd = () => {
  const [displayMode, setDisplayMode] = useState('default'); // 'default', 'sellerForm', 'status', 'myLots'
  const [formData, setFormData] = useState({
    sellerName: '',
    grade: '',
    bagSize: '',
    numberOfBags: '',
    totalQuantity: 0
  });
  const [userLots, setUserLots] = useState([]);
  const [statusLots, setStatusLots] = useState([]);
  const [approvedLots, setApprovedLots] = useState([]);
  const [soldLots, setSoldLots] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/Home');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  // const handleLogout = () => {
  //   onLogout();
  //   setIsOpen(false);
  //   navigate('/Home');
  // };

  // Modified fetchUserLots to use real-time listener
  useEffect(() => {
    if (displayMode === 'status' || displayMode === 'myLots' || displayMode === 'soldLots') {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        console.log("User is not authenticated");
        return;
      }
      
      // This query already filters lots by the current user's ID
      const userLotsQuery = query(
        collection(db, 'sellers'),
        where('userId', '==', user.uid)  // This ensures only user's own lots are fetched
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(userLotsQuery, (snapshot) => {
        const lotsData = [];
        const approvedLotsData = [];
        const soldLotsData = [];
        
        snapshot.forEach((doc) => {
          const lotData = { id: doc.id, ...doc.data() };
          lotsData.push(lotData);
          
          if (lotData.firstApproval && lotData.secondApproval) {
            approvedLotsData.push(lotData);
            
            if (lotData.sold) {
              soldLotsData.push(lotData);
            }
          }
        });
        
        // Sort arrays by createdAt in descending order (newest first)
        const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
        
        setStatusLots(lotsData.sort(sortByDate));
        setApprovedLots(approvedLotsData.sort(sortByDate));
        setSoldLots(soldLotsData.sort(sortByDate));
      }, (error) => {
        console.error("Error fetching user lots:", error);
      });

      // Cleanup subscription on unmount or when displayMode changes
      return () => unsubscribe();
    }
  }, [displayMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBagSizeClick = (size) => {
    setFormData(prev => ({
      ...prev,
      bagSize: size,
      totalQuantity: prev.numberOfBags ? size * prev.numberOfBags : 0
    }));
  };

  const handleBagsChange = (e) => {
    const bags = e.target.value;
    setFormData(prev => ({
      ...prev,
      numberOfBags: bags,
      totalQuantity: prev.bagSize ? prev.bagSize * bags : 0
    }));
  };

  const saveToFirestore = async () => {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        alert("User is not authenticated");
        return;
      }

      const userEmail = user.email;

      const userCollectionRef = collection(db, 'sellers');
      await addDoc(userCollectionRef, {
        sellerName: formData.sellerName,
        grade: formData.grade,
        bagSize: formData.bagSize,
        numberOfBags: formData.numberOfBags,
        totalQuantity: formData.totalQuantity,
        userId: user.uid,
        userEmail: userEmail,
        approvalStatus: 'pending',
        firstApproval: false,
        secondApproval: false,
        lotNumber: null, // Will be set during first approval
        createdAt: new Date().toISOString(),
        sold: false // Add sold status field
      });

      alert("Data submitted successfully! Waiting for admin approval.");
      setDisplayMode('default');
      
      // Reset form data
      setFormData({
        sellerName: '',
        grade: '',
        bagSize: '',
        numberOfBags: '',
        totalQuantity: 0
      });
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (!formData.sellerName || !formData.grade || !formData.bagSize || !formData.numberOfBags || formData.totalQuantity <= 0) {
      alert("Please fill out all the fields correctly.");
      return;
    }

    // If validation passes, save the data to Firestore
    saveToFirestore();
  };

  // Function to render the status badge based on approval status
  const renderStatusBadge = (lot) => {
    if (lot.approvalStatus === 'rejected') {
      return <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs">Rejected</span>;
    } else if (lot.secondApproval) {
      return <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs">Fully Approved</span>;
    } else if (lot.firstApproval) {
      return <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs">First Approval</span>;
    } else {
      return <span className="px-2 py-1 rounded-full bg-yellow-500 text-white text-xs">Pending</span>;
    }
  };

  // Function to format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render content based on display mode
  const renderContent = () => {
    switch (displayMode) {
      case 'sellerForm':
        return (
          <div className="flex justify-center">
            <div className="bg-[#8AB861] p-6 rounded-lg shadow-lg w-72">
              <h2 className="text-white text-center font-bold text-xl mb-4">SELLER INPUT</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleInputChange}
                  placeholder="Seller/Farmer NAME:"
                  className="w-full p-2 rounded border bg-gray-100"
                />

                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded border bg-gray-100"
                >
                  <option value="">Select Grade</option>
                  <option value="AGB">AGB (Bold)</option>
                  <option value="AGS">AGS (Special)</option>
                  <option value="AGEB">AGEB (Extra Bold)</option>
                </select>
                
                <label htmlFor="Quantity" className="text-white ml-3">Quantity:</label>
                <div className="flex gap-1 justify-around">
                  <button
                    type="button"
                    onClick={() => handleBagSizeClick(50)}
                    className={`px-4 py-2 rounded ${
                      formData.bagSize === 50 ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBagSizeClick(100)}
                    className={`px-4 py-2 rounded ${
                      formData.bagSize === 100 ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    100
                  </button>
                </div>

                {formData.bagSize && (
                  <input
                    type="number"
                    placeholder="Number of Bags"
                    value={formData.numberOfBags}
                    onChange={handleBagsChange}
                    className="w-full p-2 rounded border bg-gray-100"
                  />
                )}

                {formData.totalQuantity > 0 && (
                  <div className="text-white text-center">
                    Total Quantity: {formData.totalQuantity} kg
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode('default')}
                    className="w-1/2 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
        
      case 'status':
        return (
          <div className="max-w-2xl mx-auto border border-gray-300 rounded p-6">
            <h2 className="text-xl font-bold mb-4 text-center">Lot Approval Status</h2>
            {statusLots.length === 0 ? (
              <p className="text-center text-gray-500">You haven't uploaded any lots yet.</p>
            ) : (
              <div className="space-y-4">
                {statusLots.map((lot) => (
                  <div key={lot.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{lot.sellerName}</h3>
                      {renderStatusBadge(lot)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Grade: <span className="font-medium">{lot.grade}</span></div>
                      <div>Bag Size: <span className="font-medium">{lot.bagSize} kg</span></div>
                      <div>Bags: <span className="font-medium">{lot.numberOfBags}</span></div>
                      <div>Total: <span className="font-medium">{lot.totalQuantity} kg</span></div>
                      <div>Lot Number: <span className="font-medium">{lot.lotNumber || 'Pending'}</span></div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${lot.firstApproval ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>First Approval {lot.firstApproval ? `(${formatDate(lot.approvedAt)})` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${lot.secondApproval ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Second Approval {lot.secondApproval ? `(${formatDate(lot.finalApprovedAt)})` : ''}</span>
                        </div>
                      </div>
                      <div className="col-span-2">Created: <span className="font-medium">{formatDate(lot.createdAt)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <button 
                onClick={() => setDisplayMode('default')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        );
        
      case 'myLots':
        return (
          <div className="max-w-2xl mx-auto border border-gray-300 rounded p-6">
            <h2 className="text-xl font-bold mb-4 text-center">My Approved Lots</h2>
            {approvedLots.length === 0 ? (
              <p className="text-center text-gray-500">You don't have any approved lots yet.</p>
            ) : (
              <div className="overflow-auto max-h-96">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left">Lot No.</th>
                      <th className="py-2 px-3 text-left">Seller</th>
                      <th className="py-2 px-3 text-left">Grade</th>
                      <th className="py-2 px-3 text-left">Quantity</th>
                      <th className="py-2 px-3 text-left">Approval Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {approvedLots.map((lot) => (
                      <tr key={lot.id}>
                        <td className="py-2 px-3">{lot.lotNumber}</td>
                        <td className="py-2 px-3">{lot.sellerName}</td>
                        <td className="py-2 px-3">{lot.grade}</td>
                        <td className="py-2 px-3">{lot.totalQuantity} kg</td>
                        <td className="py-2 px-3">{formatDate(lot.finalApprovedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-center">
              <button
              onClick={() => setDisplayMode('default')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      );
      
    case 'soldLots':
      return (
        <div className="max-w-2xl mx-auto border border-gray-300 rounded p-6">
          <h2 className="text-xl font-bold mb-4 text-center">My Sold Lots</h2>
          {soldLots.length === 0 ? (
            <p className="text-center text-gray-500">You don't have any sold lots yet.</p>
          ) : (
            <div className="overflow-auto max-h-96">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left">Lot No.</th>
                    <th className="py-2 px-3 text-left">Seller</th>
                    <th className="py-2 px-3 text-left">Grade</th>
                    <th className="py-2 px-3 text-left">Quantity</th>
                    <th className="py-2 px-3 text-left">Sold Date</th>
                    <th className="py-2 px-3 text-left">Sold Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {soldLots.map((lot) => (
                    <tr key={lot.id}>
                      <td className="py-2 px-3">{lot.lotNumber}</td>
                      <td className="py-2 px-3">{lot.sellerName}</td>
                      <td className="py-2 px-3">{lot.grade}</td>
                      <td className="py-2 px-3">{lot.totalQuantity} kg</td>
                      <td className="py-2 px-3">{formatDate(lot.soldDate)}</td>
                      <td className="py-2 px-3">{lot.soldPrice ? `$${lot.soldPrice}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 text-center">
            <button 
              onClick={() => setDisplayMode('default')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="max-w-2xl mx-auto border border-gray-300 rounded p-6 min-h-32">
          {/* Empty content area when no specific mode is active */}
        </div>
      );
  }
};

return (
  <div className="w-full min-h-screen bg-white border border-gray-200">
    {/* Navigation Bar */}
    <nav className="navigationbard">
      <ProfilePopup onLogout={handleLogout} />
    </nav>

    {/* Main Content */}
    <div className="p-6">
      {/* Buttons Row */}
      <div className="flex justify-center space-x-4 mb-8">
        <button 
          className="bg-green-900 text-white px-6 py-2 rounded"
          onClick={() => setDisplayMode('sellerForm')}
        >
          Add Lots
        </button>
        <button 
          className="bg-green-900 text-white px-6 py-2 rounded"
          onClick={() => setDisplayMode('status')}
        >
          Status
        </button>
        <button 
          className="bg-green-900 text-white px-6 py-2 rounded"
          onClick={() => setDisplayMode('myLots')}
        >
          My Lots
        </button>
        <button 
          className="bg-green-900 text-white px-6 py-2 rounded"
          onClick={() => setDisplayMode('soldLots')}
        >
          Sold Lots
        </button>
      </div>

      {/* Dynamic Content Area */}
      {renderContent()}
    </div>
  </div>
);
};

export default AuctionLotAdd;