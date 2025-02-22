import React, { createContext, useContext, useState } from 'react';

const AuctionContext = createContext();

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};

const AuctionProvider = ({ children }) => {
  const [auctionData, setAuctionData] = useState({
    auctionNumber: '13/16-01-2025',
    planterQuantity: '48,319.7 Kg',
    dealerQuantity: '12,909.4 Kg',
    auctionCenter: 'PUTTADY',
    minimum: '₹2650',
    openingRate: '₹3540',
    dealerAvg: '₹3550',
    maximum: '₹3800',
    totalParticipants: '54',
    totalQuantity: '61,229.1 Kg',
    processingLotNumber: '3',
    auctionRate: '₹3200',
    currentPrice: '₹3500',
    totalLots: '302',
    lotsRemaining: '240',
    lotsSold: '62',
    lotsWithdrawn: '0',
    numberOfBags: '2',
    lotQuantity: '90kg',
    gradedTested: '-',
    reservePrice: '-',
    auctioneer: 'Idukki Dist.Traditional Cardamom Producer Company Ltd'
  });

  const updateAuctionData = (newData) => {
    setAuctionData(newData);
  };

  return (
    <AuctionContext.Provider value={{ auctionData, updateAuctionData }}>
      {children}
    </AuctionContext.Provider>
  );
};

export default AuctionProvider;