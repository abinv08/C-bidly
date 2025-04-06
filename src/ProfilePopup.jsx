import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';

const ProfilePopup = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  // Fetch user data and listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch their data
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      } else {
        // No user is signed in, redirect to login
        navigate('/', { replace: true });
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [auth, navigate]);

  // Handle logout with Firebase sign-out
  const handleLogouts = async () => {
    try {
      await signOut(auth);
      onLogout();
      setIsOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="navigationbard shadow-lg">
      <div className="flex gap-8">
        <span
          className="text-gray-600 font-medium cursor-pointer"
          onClick={() => handleNavigate('/Homes')}
        >
          Home
        </span>
        <span
          className="text-gray-600 cursor-pointer"
          onClick={() => handleNavigate('/Pricesm1')}
        >
          Prices
        </span>
        <span
          className="text-gray-600 cursor-pointer"
          onClick={() => handleNavigate('/CardamomAuctionForm')}
        >
          Auction
        </span>
        <span className="text-gray-600 cursor-pointer">About Us</span>
        <div className="navgationdivs"></div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center bg-gray-200 rounded-lg px-3 py-2 space-x-2"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{userName || 'Profile'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogouts}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}

          {isOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            ></div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ProfilePopup;