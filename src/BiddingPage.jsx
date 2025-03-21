import React, { useState } from 'react';
import ProfilePopup from './ProfilePopup';

const BiddingPage = () => {
  const [bidAmount, setBidAmount] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);
  const [showPriceForm, setShowPriceForm] = useState(false);

  // Array of lot numbers - red lots are sold
  const lots = [
    { id: 1, number: 12, color: 'red', sold: true },
    { id: 2, number: 12, color: 'red', sold: true },
    { id: 3, number: 12, color: 'red', sold: true },
    { id: 4, number: 12, color: 'green', sold: false },
    { id: 5, number: 12, color: 'green', sold: false },
    { id: 6, number: 12, color: 'green', sold: false },
    { id: 7, number: 12, color: 'green', sold: false },
    { id: 8, number: 12, color: 'green', sold: false }
  ];

  const handleLotSelect = (lot) => {
    // Don't allow selection of sold lots
    if (lot.sold) return;
    setSelectedLot(lot);
  };

  const handleBidSubmit = () => {
    if (!selectedLot) {
      alert('Please select a lot');
      return;
    }
    
    // Show the price entry form instead of submitting directly
    setShowPriceForm(true);
  };

  const handleFormClose = () => {
    setShowPriceForm(false);
  };

  const handleBuyNow = (amount) => {
    alert(`Bid of ₹${amount} submitted for Lot ${selectedLot.number}`);
    setBidAmount('');
    setShowPriceForm(false);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/Home');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="navigationbard">
        <ProfilePopup onLogout={handleLogout} />
      </nav>
      {/* Main Content */}
      <div className="flex justify-center p-6">
        <div className="w-full max-w-3xl border border-gray-300 rounded-lg p-6">
          {/* Lot Numbers Row */}
          <div className="flex justify-between mb-6">
            {lots.map((lot) => (
              <div 
                key={lot.id}
                className={`w-12 h-12 flex items-center justify-center text-white font-bold rounded-lg
                  ${lot.sold ? 'bg-red-800 opacity-60 cursor-not-allowed' : 'bg-green-900 cursor-pointer'}
                  ${selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleLotSelect(lot)}
              >
                {lot.number}
                {lot.sold && <div className="absolute text-xs font-normal">SOLD</div>}
              </div>
            ))}
          </div>

          {/* Bidding Area */}
          <div className="flex space-x-4">
            {/* Current Bid Lot */}
            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg p-4 h-36">
                <h3 className="font-bold mb-2">Current Bid Lot</h3>
                {selectedLot ? (
                  <div className="text-center mt-4">
                    <p>Lot Number: {selectedLot.number}</p>
                    <p>Lot ID: {selectedLot.id}</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 mt-4">Please select a lot</p>
                )}
              </div>
            </div>

            {/* Bidding Form */}
            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg p-4 h-36 mb-4">
                <h3 className="font-bold mb-2">Bidded Price</h3>
                <div className="mt-2">
                  
                </div>
              </div>

              {/* Bid Button */}
              <button
                onClick={handleBidSubmit}
                className={`w-full py-3 rounded-lg text-lg font-bold ${
                  selectedLot ? 'bg-green-900 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedLot}
              >
                Bid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Entry Form Modal */}
      {showPriceForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleFormClose}></div>
          <PriceEntryForm onBuyNow={handleBuyNow} onClose={handleFormClose} />
        </div>
      )}
    </div>
  );
};

// Price Entry Form Component
const PriceEntryForm = ({ onBuyNow, onClose }) => {
  const [currentPrice, setCurrentPrice] = useState(3500);
  const [enteredAmount, setEnteredAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState(currentPrice);
  const [activeButton, setActiveButton] = useState(null);
  const [lockedIncrement, setLockedIncrement] = useState(false);
  const [incrementType, setIncrementType] = useState(null);

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    if (amount === '' || /^\d+$/.test(amount)) {
      setEnteredAmount(amount);
      setTotalPrice(amount ? currentPrice + parseInt(amount) : currentPrice);
      setActiveButton(null);
      // Reset increment lock when manually entering a value
      setLockedIncrement(false);
      setIncrementType(null);
    }
  };

  // Modified to lock increment type once a button is pressed
  const handlePresetClick = (value) => {
    // If we're already locked to a different increment type, don't allow this button
    if (lockedIncrement && incrementType !== value) {
      return;
    }
    
    // Set this button as active and lock the increment type
    setActiveButton(value);
    setLockedIncrement(true);
    setIncrementType(value);
    setEnteredAmount('');
    
    // Increment the total price by the preset value
    setTotalPrice(prevTotal => prevTotal + value);
  };

  const handleBuyNowClick = () => {
    onBuyNow(totalPrice);
  };

  return (
    <div className="relative z-10 bg-[#8AB861] p-6 rounded-lg shadow-lg w-72">
      <button 
        className="absolute top-2 right-2 text-white hover:text-gray-200" 
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="bg-white rounded-lg p-3 mb-4">
        <div className="text-sm text-gray-600">Current Price:</div>
        <div className="text-2xl font-bold text-green-800">
          ₹{currentPrice}
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 mb-4">
        <div className="text-sm text-gray-600">Entered Price:</div>
        <div className="text-2xl font-bold text-green-800">
          ₹{totalPrice}
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handlePresetClick(2)}
          className={`flex-1 p-3 rounded-lg text-center transition-colors
            ${activeButton === 2 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}
            ${lockedIncrement && incrementType !== 2 ? 'opacity-50 cursor-not-allowed' : ''}
            text-2xl font-bold text-green-800`}
          disabled={lockedIncrement && incrementType !== 2}
        >
          2
        </button>
        <button
          onClick={() => handlePresetClick(5)}
          className={`flex-1 p-3 rounded-lg text-center transition-colors
            ${activeButton === 5 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}
            ${lockedIncrement && incrementType !== 5 ? 'opacity-50 cursor-not-allowed' : ''}
            text-2xl font-bold text-green-800`}
          disabled={lockedIncrement && incrementType !== 5}
        >
          5
        </button>
      </div>
      <input
        type="text"
        value={enteredAmount}
        onChange={handleAmountChange}
        placeholder="Enter Amount"
        className="w-full p-3 rounded-lg mb-4 border border-gray-300 focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleBuyNowClick}
        className="w-full bg-green-800 text-white p-3 rounded-lg hover:bg-green-900 transition-colors"
      >
        BUY NOW
      </button>
    </div>
  );
};

export default BiddingPage;