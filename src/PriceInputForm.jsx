import React, { useState } from 'react';

const PriceInputForm = () => {
  const [amount1, setAmount1] = useState('2');
  const [amount2, setAmount2] = useState('5');
  const [amount3, setAmount3] = useState('Enter Amount');
  const [currentPrice, setCurrentPrice] = useState('3500');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', { amount1, amount2, currentPrice });
    // Add your submission logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit}
        className="w-64 bg-green-500 p-4 rounded-lg shadow-lg"
      >
        {/* Current Price Display */}
        <div className="mb-4">
          <label className="block text-white text-sm mb-1">
            Current Price:
          </label>
          <div className="bg-white p-2 rounded">
            <input
              type="text"
              value={`₹${currentPrice}`}
              onChange={(e) => setCurrentPrice(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-xl font-bold text-gray-700 outline-none"
              readOnly
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-1">
            Current Price:
          </label>
          <div className="bg-white p-2 rounded">
            <input
              type="text"
              value={`₹${currentPrice + 5}`}
              onChange={(e) => setCurrentPrice(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-xl font-bold text-gray-700 outline-none"
              readOnly
            />
          </div>
        </div>

        {/* Amount Inputs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input
            type="text"
            value={amount1}
            onChange={(e) => setAmount1(e.target.value.replace(/[^0-9]/g, ''))}
            className="bg-white p-2 rounded text-center text-xl font-bold text-gray-700 outline-none"
          />
          <input
            type="text"
            value={amount2}
            onChange={(e) => setAmount2(e.target.value.replace(/[^0-9]/g, ''))}
            className="bg-white p-2 rounded text-center text-xl font-bold text-gray-700 outline-none"
          />
        </div>

        {/* Enter amount text */}
        <div className="text-center mb-4">
          <span className="text-white text-sm">Enter amount</span>
          <input
            type="text"
            value={amount3}
            onChange={(e) => setAmount3(e.target.value.replace(/[^0-9]/g, ''))}
            className="bg-white p-2 rounded text-center text-xl font-bold text-gray-700 outline-none max-w-[10em]"

          />
        </div>

        {/* Buy Now Button */}
        <button
          type="submit"
          className="w-full bg-green-800 text-white py-2 px-4 rounded 
                   hover:bg-green-900 transition-colors duration-200 
                   font-semibold text-lg"
        >
          BUY NOW
        </button>
      </form>
    </div>
  );
};

export default PriceInputForm;