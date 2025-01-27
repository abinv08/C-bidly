import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  return (
   <>
    <div className="homemaindiv">
      {/* Navigation Bar
      <nav className="flex justify-between items-center mb-8">
        <div className="flex gap-8">
          <span className="text-gray-600">Home</span>
          <span className="text-gray-600">Prices</span>
          <span className="text-gray-600 font-medium">Auction</span>
          <span className="text-gray-600">Contact Us</span>
          <span className="text-gray-600">About Us</span>
        </div> */}
        {/* <div className="cursor-pointer">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </nav> */}
      <div className='Hmaindiv'>
      {/* Hero Section */}
      <div className="hero">
        <h1 className="logo">C-BIDLY</h1>
        <p className="tagline">"Stay informed, embrace the market rhythms, and the value of cardamom."</p>
        <Link to="/LoginForm" className="sign-up-link"><button className="login-btn">LOG IN</button></Link>
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
