import React, { useState, useRef } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AuctionAdd = () => {
  const [auctionData, setAuctionData] = useState({
    auctionNo: '',
    auctionDate: '',
    auctionCenter: '',
    planterQuantity: '',
    dealerQuantity: '',
    minimum: '',
    growerAvg: '',
    dealerAvg: '',
    maximum: '',
    totalParticipates: '',
    totalQuantity: '',
    processingLotNumber: '',
    auctionAvg: '',
    totalLots: '',
    lotsRemaining: '',
    lotsSold: '',
    lotsWithdrawn: '',
    currentPrice: '',
    numberOfBags: '',
    lotQuantity: '',
    auctioneer: ''
  });

  // Track form status
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // References to maintain focus
  const inputRefs = useRef({});

  // Define field types
  const numericFields = [
    'planterQuantity', 'dealerQuantity', 'minimum', 'growerAvg', 'dealerAvg',
    'maximum', 'totalParticipates', 'totalQuantity', 'processingLotNumber',
    'auctionAvg', 'totalLots', 'lotsRemaining', 'lotsSold', 'lotsWithdrawn',
    'currentPrice', 'numberOfBags', 'lotQuantity'
  ];
  
  const quantityFields = ['planterQuantity', 'dealerQuantity', 'totalQuantity', 'lotQuantity'];
  const currencyFields = ['minimum', 'maximum', 'growerAvg', 'dealerAvg', 'auctionAvg', 'currentPrice'];

  const handleInputChange = (key, value) => {
    // Handle numeric fields - only allow numbers and decimal points
    if (numericFields.includes(key)) {
      // Allow only numbers and decimal points, strip out any other characters
      const numericValue = value.replace(/[^\d.]/g, '');
      
      setAuctionData(prev => ({
        ...prev,
        [key]: numericValue
      }));
    } else {
      setAuctionData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const db = getFirestore();
      const auctionsCollection = collection(db, "auctionadd");
      
      // Add timestamp and prepare data for Firestore
      const dataToSave = {
        ...auctionData,
        createdAt: serverTimestamp(),
      };
      
      await addDoc(auctionsCollection, dataToSave);
      setSaveSuccess(true);
      console.log('Data saved successfully to Firestore');
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInputField = ({ label, fieldKey, isGreen = false, type = "text" }) => {
    // Get the raw value from state
    const value = auctionData[fieldKey] || '';
    
    // Determine if we should use a number input type
    const inputType = type === "date" ? "date" : "text";

    if (fieldKey === 'auctionCenter') {
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="text-gray-600 text-sm block mb-1">{label}</label>
          <select
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className={`w-full text-xl font-semibold ${isGreen ? 'text-green-600' : 'text-gray-700'} 
                     border-b border-gray-200 focus:outline-none focus:border-green-500`}
          >
            <option value="">Select Center</option>
            <option value="PUTTADY">PUTTADY</option>
            <option value="BODINAYAKANUR">BODINAYAKANUR</option>
          </select>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="text-gray-600 text-sm block mb-1">{label}</label>
        <div className="relative">
          <input
            type={inputType}
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            onKeyDown={(e) => {
              // Only for numeric fields, validate input
              if (numericFields.includes(fieldKey) && 
                  !['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab', '.', 'Enter'].includes(e.key) && 
                  isNaN(Number(e.key))) {
                e.preventDefault();
              }
            }}
            className={`w-full text-xl font-semibold ${isGreen ? 'text-green-600' : 'text-gray-700'} 
                    border-b border-gray-200 focus:outline-none focus:border-green-500 ${
                     currencyFields.includes(fieldKey) ? 'pl-5' : ''}`}
          />
          {currencyFields.includes(fieldKey) && (
            <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-700">₹</span>
          )}
          {quantityFields.includes(fieldKey) && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">Kg</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderInputField({ 
            label: "AUCTION NO:", 
            fieldKey: "auctionNo", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "AUCTION DATE:", 
            fieldKey: "auctionDate", 
            type: "date", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "AUCTION CENTER:", 
            fieldKey: "auctionCenter", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "PLANTER QUANTITY:", 
            fieldKey: "planterQuantity", 
            isGreen: true 
          })}
          
          {renderInputField({ 
            label: "DEALER QUANTITY:", 
            fieldKey: "dealerQuantity", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "MINIMUM:", 
            fieldKey: "minimum", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "GROWER AVG:", 
            fieldKey: "growerAvg", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "DEALER AVG:", 
            fieldKey: "dealerAvg", 
            isGreen: true 
          })}
          
          {renderInputField({ 
            label: "MAXIMUM:", 
            fieldKey: "maximum", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "TOTAL PARTICIPATES:", 
            fieldKey: "totalParticipates", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "TOTAL QUANTITY:", 
            fieldKey: "totalQuantity", 
            isGreen: true 
          })}
          {renderInputField({ 
            label: "PROCESSING LOT NUMBER:", 
            fieldKey: "processingLotNumber", 
            isGreen: true 
          })}
          
          {renderInputField({ 
            label: "AUCTION AVG:", 
            fieldKey: "auctionAvg", 
            isGreen: true 
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Lots Information</h3>
            <div className="space-y-4">
              {renderInputField({ 
                label: "Total Lots:", 
                fieldKey: "totalLots" 
              })}
              {renderInputField({ 
                label: "Lots Remaining:", 
                fieldKey: "lotsRemaining" 
              })}
              {renderInputField({ 
                label: "Lots Sold:", 
                fieldKey: "lotsSold" 
              })}
              {renderInputField({ 
                label: "Lots Withdrawn:", 
                fieldKey: "lotsWithdrawn" 
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Current Status</h3>
            <div className="space-y-4">
              {renderInputField({ 
                label: "Current Price:", 
                fieldKey: "currentPrice" 
              })}
              {renderInputField({ 
                label: "Number of Bags:", 
                fieldKey: "numberOfBags" 
              })}
              {renderInputField({ 
                label: "Lot Quantity:", 
                fieldKey: "lotQuantity" 
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          {renderInputField({ 
            label: "AUCTIONEER:", 
            fieldKey: "auctioneer" 
          })}
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            Auction data saved successfully!
          </div>
        )}
        
        {saveError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error saving data: {saveError}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${isSaving ? 'bg-gray-500' : 'bg-green-700 hover:bg-green-800'} 
                      text-white px-8 py-3 rounded-lg 
                      transition-colors duration-200 font-semibold text-lg`}
          >
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionAdd;