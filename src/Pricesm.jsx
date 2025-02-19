import React, { useEffect, useState } from 'react';
import { auth, firestore } from './Firebase'; 
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfilePhoto from './assets/ProfilePhoto.png';

const Pricesm= () => {
  const [user, setUser] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if email is verified
        if (currentUser.emailVerified) {
          try {
            // Update Firestore user document to mark email as verified
            const userRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(userRef, {
              emailVerified: true
            });
            
            setIsEmailVerified(true);
          } catch (error) {
            console.error("Error updating user verification status:", error);
          }
        } else {
          // If email is not verified, redirect to verification page
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
        // No user is signed in
        navigate('/LoginForm');
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [auth, navigate]);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/Home');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Only render the full content if user is verified
  if (!isEmailVerified) {
    return null; // or a loading spinner
  }

  return (
<>
      <div className="pricemaindiv">
       
        <nav className="navigationbard">
        <div className="flex gap-8">
        <Link to="/Homes"><span className="text-gray-600">Home</span></Link>
          <Link to="/Pricesm"><span className="text-gray-600  font-medium">Prices</span></Link>
          <Link to="/AuctionPage"><span className="text-gray-600 ">Auction</span></Link>
          <span className="text-gray-600">Contact Us</span>
          <span className="text-gray-600">About Us</span>
        </div>
         <div className='navigationbardimg'>
          {/* Show the user's profile image and name if they are logged in */}
          {user ? (
            <>
              <img onClick={handleLogout} 
                className="userimage"
                src={ProfilePhoto}
                // src={user.photoURL} // User's photo URL from Firebase
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
        </div>
      </nav>

        <div className="container">
          <h1 className='priceheader'>Live Cardamom Price</h1>

          <div className="toggle-container">
          <Link to="/Pricesm"> <button className="toggle-btn active">Small Cardamom</button></Link>
           <Link to="/Pricela"> <button className="toggle-btn">Large Cardamom</button></Link>
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
                <div className="price-label" >Max Price</div>
                <div className="price-value" id="SMaxprice">₹3000</div>
                <div className="price-label">Min Price</div>
                <div className="price-value" id="SMinprice">₹2000</div>
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