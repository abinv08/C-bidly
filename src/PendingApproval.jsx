import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const PendingApproval = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/LoginForm');
          return;
        }

        const registrationsRef = collection(firestore, 'auctions');
        const q = query(registrationsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, [navigate]);

  const handleOkClick = () => {
    if (userRole === 'seller') {
      navigate('/SAuctionPage');
    } else if (userRole === 'buyer') {
      navigate('/AuctionPage');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Registration Pending Approval</h2>
        <p className="text-gray-600 mb-4">
          Your registration is currently under review. You will be notified once an admin approves your registration.
        </p>
        <p className="text-gray-600 mb-6">
          You can view the auction page, but some features will be restricted until approval.
        </p>
        <button
          onClick={handleOkClick}
          className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;