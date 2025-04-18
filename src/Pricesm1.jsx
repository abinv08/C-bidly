import React, { useEffect, useState } from 'react';
import { auth, firestore } from './Firebase';
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfilePhoto from './assets/ProfilePhoto.png';
import ProfilePopup from './ProfilePopup';

const Pricesm1 = () => {
  const [user, setUser] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [priceData, setPriceData] = useState({
    bodinayakanur: {
      maxPrice: '₹ -',
      minPrice: '₹ -',
      date: '-'
    },
    puttady: {
      maxPrice: '₹ -',
      minPrice: '₹ -',
      date: '-'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  // Function to fetch data from Google Apps Script
  const fetchPriceData = async () => {
    try {
      setIsLoading(true);
      // Replace with your deployed Google Apps Script URL
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyGNHXU5ovYN9D3XFZylnEwy5oOGQR78QfPldTQQtFfN4ulYugToYrlUcafWUvZTT43w/exec';
      
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price data:', error);
      toast.error('Failed to fetch latest prices', {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling interval
  useEffect(() => {
    fetchPriceData();
    const intervalId = setInterval(fetchPriceData, 300000); // 5 minutes
    return () => clearInterval(intervalId);
  }, []);

 

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      
      // Check if user is signed in with Google
      const isGoogleUser = currentUser.providerData.some(
        provider => provider.providerId === 'google.com'
      );

      if (isGoogleUser || currentUser.emailVerified) {
        try {
          const userRef = doc(firestore, 'users', currentUser.uid);
          await updateDoc(userRef, {
            emailVerified: true
          });
          setIsEmailVerified(true);
        } catch (error) {
          console.error("Error updating user verification status:", error);
          // Still set isEmailVerified to true even if Firestore update fails
          setIsEmailVerified(true);
        }
      } else {
        toast.error("Please verify your email before accessing this page", {
          position: "top-center",
        });
        navigate("/VerifyEmail", { 
          state: { 
            email: currentUser.email,
            uid: currentUser.uid 
          } 
        });
      }
    } else {
      navigate('/LoginForm');
    }
  });

  return () => unsubscribe();
}, [auth, navigate]);



  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handlePriceTrendClick = () => {
    navigate('/CardamomPriceTracker');
  };

  if (!isEmailVerified) {
    return null;
  }

  return (
    <div className="pricemaindiv">
     
      
      <nav className="navigationbard">
        <ProfilePopup onLogout={handleLogout} />
      </nav>

      <div className="container">
      <button 
          onClick={handlePriceTrendClick}
          className="price-trend-btn"
          style={{
            position: 'absolute',
            right: '20px',
            top: '60px',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Price Trend
        </button>
        <h1 className='priceheader'>Live Cardamom Price</h1>

        {/* <div className="toggle-container">
          <Link to="/Pricesm"><button className="toggle-btn active">Small Cardamom</button></Link>
          <Link to="/Pricela"><button className="toggle-btn">Large Cardamom</button></Link>
        </div> */}

        {isLoading ? (
          <div className="text-center py-4">Loading prices...</div>
        ) : (
          <div className="price-display">
            <div className="price-card">
              <h2 className="location-header">Bodinayakanur</h2>
              <div className="date-box">
                <div className="cardamom-icon"></div>
                <span>Date/Last Auction</span>
              </div>
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                {priceData.bodinayakanur.date}
              </div>
              <div className="price-box">
                <div className="price-label">Max Price</div>
                <div className="price-value" id="SMaxprice">
                  {priceData.bodinayakanur.maxPrice}
                </div>
                <div className="price-label">Min Price</div>
                <div className="price-value" id="SMinprice">
                  {priceData.bodinayakanur.minPrice}
                </div>
                <div className="price-note">Daily Auction Price Of Small/Green Cardamom</div>
              </div>
            </div>

            <div className="center-content">
              <div className="cardamom-image"></div>
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
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                {priceData.puttady.date}
              </div>
              <div className="price-box">
                <div className="price-label">Max Price</div>
                <div className="price-value">
                  {priceData.puttady.maxPrice}
                </div>
                <div className="price-label">Min Price</div>
                <div className="price-value">
                  {priceData.puttady.minPrice}
                </div>
                <div className="price-note">Daily Auction Price Of Small/Green Cardamom</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricesm1;