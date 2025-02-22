import React from 'react';

const AprovalPanel = () => {
  return (
    <div className="flex h-screen min-w-[79rem]">
      {/* Left Sidebar */}
      {/* <div className="w-48 bg-green-600 text-white">
        <div className="p-4 text-lg">Admin Panel</div>
        <nav className="flex flex-col">
          <button className="text-left px-4 py-2 bg-green-700 text-white">Dashboard</button>
          <button className="text-left px-4 py-2 text-white">Approvals</button>
          <button className="text-left px-4 py-2 text-white">Auction</button>
          <button className="text-left px-4 py-2 text-white">Accounts</button>
          <button className="text-left px-4 py-2 text-white">Review</button>
        </nav>
      </div> */}

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white ">
        {/* Stats Cards */}
        <div className="flex gap-8 mb-8">
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Seller/ Farmer</div>
            <div className="text-2xl font-bold">3</div>
          </div>
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Buyer</div>
            <div className="text-2xl font-bold">5</div>
          </div>
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Total</div>
            <div className="text-2xl font-bold">8</div>
          </div>
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Pending Approval</div>
            <div className="text-2xl font-bold">10</div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="pb-3">Auction No</th>
              <th className="pb-3">Center</th>
              <th className="pb-3">Total Quantity</th>
              <th className="pb-3">Current Price</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">13/15-01-2025</td>
              <td>PUTTADY</td>
              <td>61,229.1 kg</td>
              <td>₹3500</td>
              <td><span className="text-green-500">Active</span></td>
              <td className="flex gap-2">
                <button className="text-gray-600">✏️</button>
                <button className="text-red-500">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AprovalPanel;