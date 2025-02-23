import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import { auth } from './Firebase'; // Adjust the import to your Firebase config file

const SellerInputForm = () => {
  const navigate = useNavigate();  // Initialize useNavigate
  const [formData, setFormData] = useState({
    sellerName: '',
    grade: '',
    bagSize: '',
    numberOfBags: '',
    totalQuantity: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBagSizeClick = (size) => {
    setFormData(prev => ({
      ...prev,
      bagSize: size,
      totalQuantity: prev.numberOfBags ? size * prev.numberOfBags : 0
    }));
  };

  const handleBagsChange = (e) => {
    const bags = e.target.value;
    setFormData(prev => ({
      ...prev,
      numberOfBags: bags,
      totalQuantity: prev.bagSize ? prev.bagSize * bags : 0
    }));
  };

  // Save the form data to Firestore
  const saveToFirestore = async () => {
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) {
        console.log("User is not authenticated");
        return;
      }

      // You can store the form data under a specific collection for each user
      const userCollectionRef = collection(db, 'sellers');
      await addDoc(userCollectionRef, {
        sellerName: formData.sellerName,
        grade: formData.grade,
        bagSize: formData.bagSize,
        numberOfBags: formData.numberOfBags,
        totalQuantity: formData.totalQuantity,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // After successful submission, show an alert
      alert("Data submitted successfully!");

      // Navigate to AuctionPage after the alert
      navigate('/SAuctionPage');  // Adjust the route path to your AuctionPage
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };

  // Validate form fields and submit to Firestore
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (!formData.sellerName || !formData.grade || !formData.bagSize || !formData.numberOfBags || formData.totalQuantity <= 0) {
      alert("Please fill out all the fields correctly.");
      return;
    }

    // If validation passes, save the data to Firestore
    saveToFirestore();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100/10">
      <div className="bg-[#8AB861] p-6 rounded-lg shadow-lg w-72">
        <h2 className="text-white text-center font-bold text-xl mb-4">SELLER INPUT</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="sellerName"
            value={formData.sellerName}
            onChange={handleInputChange}
            placeholder="Seller/Farmer NAME:"
            className="w-full p-2 rounded border bg-gray-100"
          />

          <select
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            className="w-full p-2 rounded border bg-gray-100"
          >
            <option value="">Select Grade</option>
            <option value="AGB">AGB (Bold)</option>
            <option value="AGS">AGS (Special)</option>
            <option value="AGEB">AGEB (Extra Bold)</option>
          </select>
          
          <label htmlFor="Quantity" className="text-white ml-3">Quantity:</label>
          <div className="flex gap-1 justify-around">
            <button
              type="button"
              onClick={() => handleBagSizeClick(50)}
              className={`px-4 py-2 rounded ${
                formData.bagSize === 50 ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              50
            </button>
            <button
              type="button"
              onClick={() => handleBagSizeClick(100)}
              className={`px-4 py-2 rounded ${
                formData.bagSize === 100 ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              100
            </button>
          </div>

          {formData.bagSize && (
            <input
              type="number"
              placeholder="Number of Bags"
              value={formData.numberOfBags}
              onChange={handleBagsChange}
              className="w-full p-2 rounded border bg-gray-100"
            />
          )}

          {formData.totalQuantity > 0 && (
            <div className="text-white text-center">
              Total Quantity: {formData.totalQuantity} kg
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerInputForm;
