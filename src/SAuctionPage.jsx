import React, { useState, useEffect } from 'react';
import ProfilePopup from './ProfilePopup';
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { firestore } from './Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';


const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {children}
    </div>
);



// const handleLogout = async () => {
//   const auth = getAuth();
//   try {
//     await signOut(auth);
//     const navigate = useNavigate();
//     navigate('/Home');
//   } catch (error) {
//     console.error("Error during logout:", error);
//   }
// };

  
  const SAuctionPage = () => {
    const navigate = useNavigate();
    const [isApproved, setIsApproved] = useState(false);
    
    useEffect(() => {
      const checkApprovalStatus = async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          
          // if (!user) {
          //   navigate('/LoginForm');
          //   return;
          // }
  
          const registrationsRef = collection(firestore, 'auctions');
          const q = query(registrationsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setIsApproved(userData.isApproved || false);
          }
        } catch (error) {
          console.error("Error checking approval status:", error);
        }
      };
  
      checkApprovalStatus();
    }, [navigate]);
  
    const handleButtonClick = () => {
      if (isApproved) {
        navigate('/AuctionLotAdd');
      } else {
        alert('Please wait for admin approval to access this feature.');
      }
    };
  
    const handleLogout = async () => {
      const auth = getAuth();
      try {
        await signOut(auth);
        navigate('/Home');
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
  return (
    <>
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      {/* Header */}
      <nav className="navigationbardauc">
       
        <ProfilePopup onLogout={handleLogout} />
      </nav>

      <h1 className="text-4xl font-bold text-center mb-8">Live Cardamom Auction</h1>

      {/* Top Row Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">AUCTION NO/ DATE:</div>
            <div className="text-green-700 text-xl">13/15-01-2025</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">PLANTER QUANTITY:</div>
            <div className="text-green-700 text-xl">48,319.7 Kg</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">DEALER QUANTITY:</div>
            <div className="text-green-700 text-xl">12,909.4 Kg</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">AUCTION CENTER:</div>
            <div className="text-green-700 text-xl">PUTTADY</div>
          </div>
        </Card>
      </div>

      {/* Middle Row Cards */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">MINIMUM:</div>
            <div className="text-green-700 text-xl">₹2650</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">GROWER AVG:</div>
            <div className="text-green-700 text-xl">₹3540</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">DEALER AVG:</div>
            <div className="text-green-700 text-xl">₹3550</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">MAXIMUM:</div>
            <div className="text-green-700 text-xl">₹3800</div>
          </div>
        </Card>
      </div>

      {/* Bottom Row Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">TOTAL PARTICIPATES:</div>
            <div className="text-green-700 text-xl">54</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">TOTAL QUANTITY:</div>
            <div className="text-green-700 text-xl">61,229.1 Kg</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">PROCESSING LOT NUMBER:</div>
            <div className="text-green-700 text-xl">3</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">AUCTION AVG:</div>
            <div className="text-green-700 text-xl">₹3200</div>
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Lots:</span>
              <span className="text-green-700 text-xl">302</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lots Remaining:</span>
              <span className="text-green-700 text-xl">240</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lots Sold:</span>
              <span className="text-green-700 text-xl">62</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lots Withdrawn:</span>
              <span className="text-green-700 text-xl">0</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleButtonClick}
            className={`px-8 py-3 rounded-lg font-medium text-lg text-white transition-colors ${
              isApproved 
                ? 'bg-green-900 hover:bg-green-800 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            LOTS
          </button>
          {!isApproved && (
            <div className="text-sm text-gray-500">
              Waiting for admin approval
            </div>
          )}
          <Card className="w-full">
            <div className="p-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Current Price:</div>
                <div className="text-green-700 text-3xl font-semibold">₹3500</div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Number of Bags:</span>
              <span className="text-green-700 text-xl">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lot Quantity:</span>
              <span className="text-green-700 text-xl">90kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Graded/Tested:</span>
              <span className="text-green-700 text-xl">-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reserve Price:</span>
              <span className="text-green-700 text-xl">-</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <Card>
        <div className="p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-gray-600 mb-1">Auctioneer:</div>
          <div className="text-green-700">Idukki Dist.Traditional Cardamom Producer Company Ltd</div>
        </div>
      </Card>
    </div>
    </>
  )
}

export default SAuctionPage