import React from 'react';

const PaymentReceipt = ({ receiptData, onClose, onPrint }) => {
  if (!receiptData) return null;

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="text-center mb-4 border-b-2 border-gray-200 pb-4">
        <h2 className="text-2xl font-bold">Payment Receipt</h2>
        <p className="text-green-600 font-bold">Payment Successful</p>
      </div>
      <div className="text-center mb-4">
        <div className="text-xl font-bold">Token Number: {receiptData.tokenNumber}</div>
        <div className="text-sm text-gray-600 md:w-auto w-full">Keep this number for reference</div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="grid grid-cols-2">
          <p className="font-semibold">Date:</p>
          <p>{receiptData.timestamp.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Payment ID:</p>
          <p className="break-words">{receiptData.paymentId}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Auction No:</p>
          <p>{receiptData.auctionNo}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Center:</p>
          <p>{receiptData.center}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Quantity:</p>
          <p>{receiptData.quantity} Kg</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Seller:</p>
          <p>{receiptData.seller}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Grade:</p>
          <p>{receiptData.grade}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="font-semibold">Amount Paid:</p>
          <p className="font-bold">₹{parseInt(receiptData.amount).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
        <button
          onClick={onPrint}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PaymentReceipt;