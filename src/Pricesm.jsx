import React, { useEffect, useState } from 'react';
import { auth } from './Firebase'; // Make sure auth is exported correctly from Firebase.js
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut for logout functionality
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const Pricesm = () => {
  const [user, setUser] = useState(null); // To store user info
  const navigate = useNavigate(); // Hook to handle redirection

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in
        setUser(currentUser);
      } else {
        // No user is signed in
        setUser(null);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/Home'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <div className="pricemaindiv">
        <nav>
          <a href="#">Home</a>
          <a href="#">Prices</a>
          <a href="#">Auction</a>
          <a href="#">Contact Us</a>
          <a href="#">About Us</a>

          {/* Show the user's profile image and name if they are logged in */}
          {user ? (
            <>
              <img onClick={handleLogout} 
                className="userimage"
                src={user.photoURL} // User's photo URL from Firebase
                alt="user photo"
                // width={"15%"}
                // style={{ borderRadius: "100%", cursor: "pointer" }} // Add cursor pointer to indicate clickable
                // Handle click to logout
              />
              <p className="username">{user.displayName}</p> {/* User's name from Firebase */}
            </>
          ) : (
            <p className="username">Guest</p> // If the user is not logged in, show "Guest"
          )}
        </nav>
        <nav className="flex justify-between items-center mb-8">
        <div className="flex gap-8">
          <span className="text-gray-600">Home</span>
          <span className="text-gray-600">Prices</span>
          <span className="text-gray-600 font-medium">Auction</span>
          <span className="text-gray-600">Contact Us</span>
          <span className="text-gray-600">About Us</span>
        </div>
        <div className="cursor-pointer">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </nav>

        <div className="container">
          <h1 className='priceheader'>Live Cardamom Price</h1>

          <div className="toggle-container">
            <button className="toggle-btn active">Small Cardamom</button>
            <button className="toggle-btn">Large Cardamom</button>
          </div>

          <div className="price-display">
            <div className="price-card">
              <h2 className="location-header">Bodinayakanur</h2>
              <div className="date-box">
                <div className="cardamom-icon"></div>
                <span>Date/Last Auction</span>
              </div>
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>11-Jan-2024</div>
              <div className="price-box">
                <div className="price-label">Max Price</div>
                <div className="price-value">₹3000</div>
                <div className="price-label">Min Price</div>
                <div className="price-value">₹2000</div>
                <div className="price-note">Daily Auction Price Of Small/Green Cardamom</div>
              </div>
            </div>

            <div className="center-content">
              <img src="/api/placeholder/400/400" alt="Green Cardamom" className="cardamom-image" />
              <div className="cardamom-type">
                <div className="cardamom-icon"></div>
                <span>Small Green Cardamom</span>
              </div>
            </div>

            <div className="price-card">
              <h2 className="location-header">Puttady</h2>
              <div className="date-box">
                <div className="cardamom-icon"></div>
                <span>Date/Last Auction</span>
              </div>
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>11-Jan-2024</div>
              <div className="price-box">
                <div className="price-label">Max Price</div>
                <div className="price-value">₹3000</div>
                <div className="price-label">Min Price</div>
                <div className="price-value">₹2000</div>
                <div className="price-note">Daily Auction Price Of Small/Green Cardamom</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricesm;
