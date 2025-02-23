import React, { useState } from 'react';

const PriceEntryForm = () => {
  const [currentPrice, setCurrentPrice] = useState(3500);
  const [enteredAmount, setEnteredAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState(currentPrice);
  const [activeButton, setActiveButton] = useState(null);

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    if (amount === '' || /^\d+$/.test(amount)) {
      setEnteredAmount(amount);
      setTotalPrice(amount ? currentPrice + parseInt(amount) : currentPrice);
      setActiveButton(null);
    }
  };

  const handlePresetClick = (value) => {
    setActiveButton(value);
    setEnteredAmount('');
    setTotalPrice(currentPrice + value);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100/10">
      <div className="bg-[#8AB861] p-6 rounded-lg shadow-lg w-72">
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
               text-2xl font-bold text-green-800`}>  2
          </button>
          <button
           onClick={() => handlePresetClick(5)}
            className={`flex-1 p-3 rounded-lg text-center transition-colors 
            ${activeButton === 5 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'} 
            text-2xl font-bold text-green-800`}> 5
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
          className="w-full bg-green-800 text-white p-3 rounded-lg hover:bg-green-900 transition-colors"
         >
          BUY NOW
        </button>
      </div>
    </div>
  );
};

export default PriceEntryForm;