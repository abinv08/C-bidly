import React from 'react'
import { useNavigate } from 'react-router-dom';
import ProfilePopup from './ProfilePopup';
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';


const handleLogout = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    const navigate = useNavigate();
    navigate('/Home');
  } catch (error) {
    console.error("Error during logout:", error);
  }
};



const Homes = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };
  return (
   <>
    <div className="homemaindiv">
    <nav className="navigationbard">
       
        <ProfilePopup onLogout={handleLogout} />
      </nav>
      <div className='Hmaindiv'>
         {/* Navigation Bar */}
      
      {/* Hero Section */}
      <div className="hero">
        <h1 className="logo">C-BIDLY</h1>
        <p className="tagline">"Stay informed, embrace the market rhythms, and the value of cardamom."</p>
      </div>

      {/* Content Section */}
      <section className="content">
        <h2 className="main-heading">
          Stay Informed, Embrace<br />The Market Rhythms,<br />And The Value Of Cardamom.
        </h2>
        <div className="cards-container">
      <div
        className="card-p cursor-pointer"
        onClick={() => handleNavigate('/CardamomAuctionForm')}
      >
        <h3 style={{ color: 'white' }}>Cardamom</h3>
        <p style={{ color: 'white' }}>Auction</p>
      </div>
      
      <div
        className="card-p cursor-pointer"
        onClick={() => handleNavigate('/Pricesm1')}
      >
        <h3 style={{ color: 'white' }}>Cardamom</h3>
        <p style={{ color: 'white' }}>Price Today</p>
      </div>
    </div>
      </section>
      </div>
    </div>
   
   </>
  )
}

export default Homes
