import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePopup = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
    navigate('/Home');
  };

  return (
     
    <nav className="navigationbard">
        <div className="flex gap-8">
          <Link to="/Homes"><span className="text-gray-600 font-medium font-color:green">Home</span></Link>
          <Link to="/Pricesm1"><span className="text-gray-600">Prices</span></Link>
          <Link to="/CardamomAuctionForm"><span className="text-gray-600 ">Auction</span></Link>
          <span className="text-gray-600">Contact Us</span>
          <span className="text-gray-600">About Us</span>
          <div className='navgationdivs'> </div>
          <div className="relative">
      {/* Profile Button */}
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
        {/* <span className="text-gray-600">Profile</span> */}
      </button>
      
      {/* Popup Menu */}
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
                <p className="text-sm font-medium text-gray-700">Profile</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}

      {/* Overlay to close popup when clicking outside */}
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