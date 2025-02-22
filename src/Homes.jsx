import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import ProfilePopup from './ProfilePopup';


const handleLogout = async () => {
  try {
    await signOut(auth);
    navigate('/Home');
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

const Homes = () => {
  return (
   <>
    <div className="homemaindiv">
    <nav className="navigationbard">
        {/* <div className="flex gap-8">
          <Link to="/Homes"><span className="text-gray-600 font-medium font-color:green">Home</span></Link>
          <Link to="/Pricesm1"><span className="text-gray-600">Prices</span></Link>
          <Link to="/AuctionPage"><span className="text-gray-600 ">Auction</span></Link>
          <span className="text-gray-600">Contact Us</span>
          <span className="text-gray-600">About Us</span>
        </div> */}
        <ProfilePopup onLogout={handleLogout} />
      </nav>
      <div className='Hmaindiv'>
         {/* Navigation Bar */}
      
      {/* Hero Section */}
      <div className="hero">
        <h1 className="logo">C-BIDLY</h1>
        <p className="tagline">"Stay informed, embrace the market rhythms, and the value of cardamom."</p>
        {/* <Link to="/LoginForm" className="sign-up-link"><button className="login-btn">LOG IN</button></Link> */}
      </div>

      {/* Content Section */}
      <section className="content">
        <h2 className="main-heading">
          Stay Informed, Embrace<br />The Market Rhythms,<br />And The Value Of Cardamom.
        </h2>
        <div className="cards-container">
        <Link to="/CardamomAuctionForm" className="card-p">
            <h3 style={{color:'white'}}>Cardamom</h3>
            <p style={{color:'white'}}>Auction</p>
          {/* </div> */}
          </Link>
         <Link to="/Pricesm1" className="card-p">
            <h3 style={{color:'white'}}>Cardamom</h3>
            <p style={{color:'white'}}>Price Today</p>
          </Link>
        </div>
      </section>
      </div>
    </div>
   
   </>
  )
}

export default Homes
