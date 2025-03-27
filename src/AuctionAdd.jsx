import React, { useState, useRef, useEffect } from 'react';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';

const AuctionAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preFillData = {}, isEdit = false } = location.state || {};
  const db = getFirestore();

  useEffect(() => {
    if (!isEdit || !preFillData.id) {
      navigate('/AdminAuctionPage');
    }
  }, [isEdit, preFillData, navigate]);

  const [auctionData, setAuctionData] = useState({
    auctionNo: preFillData.auctionNo || '',
    auctionDate: preFillData.auctionDate || '',
    auctionCenter: preFillData.auctionCenter || '',
    minimum: preFillData.minimum || '',
    maximum: preFillData.maximum || '',
    totalQuantity: preFillData.totalQuantity || '',
    processingLotNumber: preFillData.processingLotNumber || '',
    auctionAvg: preFillData.auctionAvg || '',
    lotDetails: {
      grade: preFillData.lotDetails?.grade || '',
      totalQuantity: preFillData.lotDetails?.totalQuantity || '',
      numberOfBags: preFillData.lotDetails?.numberOfBags || '',
      bagSize: preFillData.lotDetails?.bagSize || '',
      lotNumber: preFillData.lotDetails?.lotNumber || '',
      sellerName: preFillData.lotDetails?.sellerName || ''
    },
    currentPrice: preFillData.currentPrice || '',
    numberOfBags: preFillData.numberOfBags || '',
    lotQuantity: preFillData.lotQuantity || '',
    auctioneer: preFillData.auctioneer || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const inputRefs = useRef({});

  const numericFields = [
    'minimum', 'maximum', 'totalQuantity', 'processingLotNumber',
    'auctionAvg', 'currentPrice', 'numberOfBags', 'lotQuantity'
  ];
  
  const quantityFields = ['totalQuantity', 'lotQuantity'];
  const currencyFields = ['minimum', 'maximum', 'auctionAvg', 'currentPrice'];

  useEffect(() => {
    if (preFillData && Object.keys(preFillData).length > 0) {
      const min = preFillData.minimum || '';
      const max = preFillData.maximum || '';
      const avg = min && max ? (parseFloat(min) + parseFloat(max)) / 2 : '';
      
      setAuctionData({
        auctionNo: preFillData.auctionNo || '',
        auctionDate: preFillData.auctionDate || '',
        auctionCenter: preFillData.auctionCenter || '',
        minimum: min,
        maximum: max,
        totalQuantity: preFillData.totalQuantity || '',
        processingLotNumber: preFillData.processingLotNumber || '',
        auctionAvg: avg,
        lotDetails: {
          grade: preFillData.lotDetails?.grade || '',
          totalQuantity: preFillData.lotDetails?.totalQuantity || '',
          numberOfBags: preFillData.lotDetails?.numberOfBags || '',
          bagSize: preFillData.lotDetails?.bagSize || '',
          lotNumber: preFillData.lotDetails?.lotNumber || '',
          sellerName: preFillData.lotDetails?.sellerName || ''
        },
        currentPrice: min,
        numberOfBags: preFillData.numberOfBags || '',
        lotQuantity: preFillData.lotQuantity || '',
        auctioneer: preFillData.auctioneer || ''
      });
    }
  }, [preFillData]);

  const handleInputChange = (key, value) => {
    if (numericFields.includes(key)) {
      const numericValue = value.replace(/[^\d.]/g, '');
      
      if (key === 'minimum' || key === 'maximum') {
        const newData = {
          ...auctionData,
          [key]: numericValue
        };
        const min = parseFloat(newData.minimum) || 0;
        const max = parseFloat(newData.maximum) || 0;
        newData.auctionAvg = min && max ? (min + max) / 2 : '';
        newData.currentPrice = newData.minimum;
        setAuctionData(newData);
      } else {
        setAuctionData(prev => ({
          ...prev,
          [key]: numericValue
        }));
      }
    } else if (key === 'lotDetails.grade') {
      setAuctionData(prev => ({
        ...prev,
        lotDetails: {
          ...prev.lotDetails,
          grade: value
        }
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
      if (!preFillData.id) {
        throw new Error("No auction ID provided for update.");
      }

      const auctionRef = doc(db, "cardamomAuctions", preFillData.id);
      const dataToSave = {
        ...auctionData,
        lotDetails: {
          grade: auctionData.lotDetails.grade,
          totalQuantity: auctionData.totalQuantity,
          numberOfBags: auctionData.numberOfBags,
          bagSize: auctionData.lotQuantity,
          lotNumber: auctionData.processingLotNumber,
          sellerName: auctionData.auctioneer
        },
        status: auctionData.status || 'pending',
        lastUpdated: serverTimestamp(),
        createdAt: preFillData.createdAt || serverTimestamp()
      };

      await updateDoc(auctionRef, dataToSave);
      setSaveSuccess(true);
      console.log('Auction updated successfully in Firestore');

      setTimeout(() => navigate('/AdminAuctionPage'), 1000);
    } catch (error) {
      console.error('Error updating auction:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInputField = ({ label, fieldKey, isGreen = false, type = "text", size = "normal" }) => {
    const value = fieldKey === 'lotDetails.grade' 
      ? auctionData.lotDetails.grade || ''
      : auctionData[fieldKey] || '';
    const inputType = type === "date" ? "date" : "text";
    const paddingClass = size === "small" ? "p-2" : size === "medium" ? "p-3" : "p-4";
    const labelClass = size === "small" ? "text-xs" : size === "medium" ? "text-sm" : "text-sm";
    const inputClass = size === "small" ? "text-base" : size === "medium" ? "text-lg" : "text-xl";

    if (fieldKey === 'auctionCenter') {
      return (
        <div className={`bg-white ${paddingClass} rounded-lg shadow`}>
          <label className={`text-gray-600 ${labelClass} block mb-1`}>{label}</label>
          <select
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className={`w-full ${inputClass} font-semibold ${isGreen ? 'text-green-600' : 'text-gray-700'} 
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
      <div className={`bg-white ${paddingClass} rounded-lg shadow`}>
        <label className={`text-gray-600 ${labelClass} block mb-1`}>{label}</label>
        <div className="relative">
          <input
            type={inputType}
            value={value}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            onKeyDown={(e) => {
              if (numericFields.includes(fieldKey) && 
                  !['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab', '.', 'Enter'].includes(e.key) && 
                  isNaN(Number(e.key))) {
                e.preventDefault();
              }
            }}
            className={`w-full ${inputClass} font-semibold ${isGreen ? 'text-green-600' : 'text-gray-700'} 
                    border-b border-gray-200 focus:outline-none focus:border-green-500 ${
                     currencyFields.includes(fieldKey) ? 'pl-5' : ''}`}
            readOnly={fieldKey === 'auctionAvg'}
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

  if (!isEdit || !preFillData.id) {
    return <div className="p-8 text-red-600">Error: This page is only for editing existing auctions.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Editing Auction</h3>
          <p className="text-sm text-blue-600">Modify the fields below and save to update the auction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderInputField({ label: "AUCTION NO:", fieldKey: "auctionNo", isGreen: true })}
          {renderInputField({ label: "AUCTION DATE:", fieldKey: "auctionDate", type: "date", isGreen: true })}
          {renderInputField({ label: "AUCTION CENTER:", fieldKey: "auctionCenter", isGreen: true })}
          
          {renderInputField({ label: "MINIMUM:", fieldKey: "minimum", isGreen: true })}
          {renderInputField({ label: "MAXIMUM:", fieldKey: "maximum", isGreen: true })}
          {renderInputField({ label: "TOTAL QUANTITY:", fieldKey: "totalQuantity", isGreen: true })}
          
          {renderInputField({ label: "PROCESSING LOT NUMBER:", fieldKey: "processingLotNumber", isGreen: true })}
          {renderInputField({ label: "AUCTION AVG:", fieldKey: "auctionAvg", isGreen: true })}
          {renderInputField({ label: "GRADE:", fieldKey: "lotDetails.grade", isGreen: true })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-3 rounded-lg shadow">
            <h3 className="text-md font-semibold mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {renderInputField({ label: "Current Price:", fieldKey: "currentPrice", size: "small" })}
              {renderInputField({ label: "Number of Bags:", fieldKey: "numberOfBags", size: "small" })}
              {renderInputField({ label: "Lot Quantity:", fieldKey: "lotQuantity", size: "small" })}
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow">
            {renderInputField({ 
              label: "AUCTIONEER:", 
              fieldKey: "auctioneer", 
              size: "medium"  // Making it smaller than full size but larger than "small"
            })}
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            Auction updated successfully!
          </div>
        )}
        
        {saveError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error updating auction: {saveError}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${isSaving ? 'bg-gray-500' : 'bg-green-700 hover:bg-green-800'} 
                      text-white px-8 py-3 rounded-lg 
                      transition-colors duration-200 font-semibold text-lg`}
          >
            {isSaving ? 'SAVING...' : 'UPDATE AUCTION'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionAdd;