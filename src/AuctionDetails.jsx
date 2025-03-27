// AuctionDetails.jsx (example)
import React from 'react';
import { useLocation } from 'react-router-dom';

const AuctionDetails = () => {
  const { state } = useLocation();
  const { preFillData } = state || {};

  if (!preFillData) return <div>No auction data available</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auction Details</h1>
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Auction No:</strong> {preFillData.auctionNo}</div>
        <div><strong>Auction Center:</strong> {preFillData.auctionCenter}</div>
        <div><strong>Auctioneer:</strong> {preFillData.auctioneer}</div>
        <div><strong>Total Quantity:</strong> {preFillData.totalQuantity} Kg</div>
        <div><strong>Number of Bags:</strong> {preFillData.numberOfBags}</div>
        <div><strong>Lot Quantity:</strong> {preFillData.lotQuantity} Kg</div>
        <div><strong>Processing Lot Number:</strong> {preFillData.processingLotNumber}</div>
        <div><strong>Minimum Price:</strong> ₹{preFillData.minimum}</div>
        <div><strong>Maximum Price:</strong> ₹{preFillData.maximum}</div>
        <div><strong>Auction Average:</strong> ₹{preFillData.auctionAvg}</div>
        <div><strong>Total Participants:</strong> {preFillData.totalParticipates}</div>
        <div><strong>Total Lots:</strong> {preFillData.totalLots}</div>
        <div><strong>Status:</strong> {preFillData.status}</div>
      </div>
    </div>
  );
};

export default AuctionDetails;