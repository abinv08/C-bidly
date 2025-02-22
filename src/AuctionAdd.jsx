import React, { useState } from 'react';

const AuctionAdd = () => {
  const [auctionData, setAuctionData] = useState({
    auctionNo: '13/15-01-2025',
    auctionCenter: 'PUTTADY',
    planterQuantity: '48,319.7',
    dealerQuantity: '12,909.4',
    minimum: '2650',
    growerAvg: '3540',
    dealerAvg: '3550',
    maximum: '3800',
    totalParticipates: '54',
    totalQuantity: '61,229.1',
    processingLotNumber: '3',
    auctionAvg: '3200',
    totalLots: '302',
    lotsRemaining: '240',
    lotsSold: '62',
    lotsWithdrawn: '0',
    currentPrice: '3500',
    numberOfBags: '2',
    lotQuantity: '90',
    auctioneer: 'Idukki Dist.Traditional Cardamom Producer Company Ltd'
  });

  const handleInputChange = (key, value) => {
    setAuctionData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving data:', auctionData);
    // Add your save logic here
  };

  const InputField = ({ label, value, fieldKey, isGreen = false }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="text-gray-600 text-sm block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
        className={`w-full text-xl font-semibold ${isGreen ? 'text-green-600' : 'text-gray-700'} 
                   border-b border-gray-200 focus:outline-none focus:border-green-500`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField 
            label="AUCTION NO/DATE:" 
            value={auctionData.auctionNo} 
            fieldKey="auctionNo"
            isGreen={true}
          />
          <InputField 
            label="PLANTER QUANTITY:" 
            value={auctionData.planterQuantity} 
            fieldKey="planterQuantity"
            isGreen={true}
          />
          <InputField 
            label="DEALER QUANTITY:" 
            value={auctionData.dealerQuantity} 
            fieldKey="dealerQuantity"
            isGreen={true}
          />
          <InputField 
            label="AUCTION CENTER:" 
            value={auctionData.auctionCenter} 
            fieldKey="auctionCenter"
            isGreen={true}
          />
          
          <InputField 
            label="MINIMUM:" 
            value={`₹${auctionData.minimum}`} 
            fieldKey="minimum"
            isGreen={true}
          />
          <InputField 
            label="GROWER AVG:" 
            value={`₹${auctionData.growerAvg}`} 
            fieldKey="growerAvg"
            isGreen={true}
          />
          <InputField 
            label="DEALER AVG:" 
            value={`₹${auctionData.dealerAvg}`} 
            fieldKey="dealerAvg"
            isGreen={true}
          />
          <InputField 
            label="MAXIMUM:" 
            value={`₹${auctionData.maximum}`} 
            fieldKey="maximum"
            isGreen={true}
          />
          
          <InputField 
            label="TOTAL PARTICIPATES:" 
            value={auctionData.totalParticipates} 
            fieldKey="totalParticipates"
            isGreen={true}
          />
          <InputField 
            label="TOTAL QUANTITY:" 
            value={`${auctionData.totalQuantity} Kg`} 
            fieldKey="totalQuantity"
            isGreen={true}
          />
          <InputField 
            label="PROCESSING LOT NUMBER:" 
            value={auctionData.processingLotNumber} 
            fieldKey="processingLotNumber"
            isGreen={true}
          />
          <InputField 
            label="AUCTION AVG:" 
            value={`₹${auctionData.auctionAvg}`} 
            fieldKey="auctionAvg"
            isGreen={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Lots Information</h3>
            <div className="space-y-4">
              <InputField 
                label="Total Lots:" 
                value={auctionData.totalLots} 
                fieldKey="totalLots"
              />
              <InputField 
                label="Lots Remaining:" 
                value={auctionData.lotsRemaining} 
                fieldKey="lotsRemaining"
              />
              <InputField 
                label="Lots Sold:" 
                value={auctionData.lotsSold} 
                fieldKey="lotsSold"
              />
              <InputField 
                label="Lots Withdrawn:" 
                value={auctionData.lotsWithdrawn} 
                fieldKey="lotsWithdrawn"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Current Status</h3>
            <div className="space-y-4">
              <InputField 
                label="Current Price:" 
                value={`₹${auctionData.currentPrice}`} 
                fieldKey="currentPrice"
              />
              <InputField 
                label="Number of Bags:" 
                value={auctionData.numberOfBags} 
                fieldKey="numberOfBags"
              />
              <InputField 
                label="Lot Quantity:" 
                value={`${auctionData.lotQuantity}kg`} 
                fieldKey="lotQuantity"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <InputField 
            label="AUCTIONEER:" 
            value={auctionData.auctioneer} 
            fieldKey="auctioneer"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 
                     transition-colors duration-200 font-semibold text-lg"
          >
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionAdd;