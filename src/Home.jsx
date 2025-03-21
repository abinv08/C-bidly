import React from 'react'
import {  useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/LoginForm');
  };
  return (
   <>
    <div className="homemaindiv">
     
      <div className='Hmaindiv'>
      {/* Hero Section */}
      <div className="hero">
        <h1 className="logo">C-BIDLY</h1>
        <p className="tagline">"Stay informed, embrace the market rhythms, and the value of cardamom."</p>
        <button 
        className="login-btn"
        onClick={handleLoginRedirect}
      > LOG IN
      </button>
      </div>

      {/* Content Section */}
      <section className="content">
        <h2 className="main-heading">
          Stay Informed, Embrace<br />The Market Rhythms,<br />And The Value Of Cardamom.
        </h2>
        <div className="cards-container">
          {/* <div className="card">
            <h3>Cardamom</h3>
            <p>Auction</p>
          </div>
          <div className="card">
            <h3>Cardamom</h3>
            <p>Price Today</p>
          </div> */}
        </div>
      </section>
      </div>
    </div>
   
   </>
  )
}

export default Home
