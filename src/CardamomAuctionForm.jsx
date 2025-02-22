import React, { useState } from 'react';
import './CardamomAuctionForm.css';
import axios from 'axios';
import { firestore } from './Firebase'; // Import your firebase configuration
import { collection, addDoc } from 'firebase/firestore'; // Firestore functions for adding documents

const CardamomAuctionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    gst: '',
    license: '',
    role: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prevState => ({
      ...prevState,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('gst', formData.gst);
    formDataToSend.append('license', formData.license);
    formDataToSend.append('role', formData.role);

    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      // Save data to Firebase Firestore
      const docRef = await addDoc(collection(firestore, 'auctions'), {
        name: formData.name,
        gst: formData.gst,
        license: formData.license,
        role: formData.role,
        image: formData.image ? formData.image.name : null // You may need to handle file upload and get the URL
      });

      console.log('Document written with ID: ', docRef.id);

      // Send data to backend via axios (optional)
      // const response = await axios.post('http://localhost:5000/register', formDataToSend, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      // alert(response.data.message);
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
    <div className="auction-container">
      <div className="form-container-c">
        <br />
        <div className="register-box">
          <h2>AUCTION REGISTRATION</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="AUCTIONOR NAME / COMPANY NAME"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="gst"
              placeholder="GST NO:"
              value={formData.gst}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="license"
              placeholder="SPICESBOARD LICENCE NO:"
              value={formData.license}
              onChange={handleChange}
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="buyer">BUYER</option>
              <option value="seller">SELLER/FARMER</option>
            </select>

            {/* Conditionally render image upload for Buyer role */}
            {formData.role === 'buyer' && (
              <div>
                <label htmlFor="image" className="image-label"> Bank Proof (5 Cr Security Deposit)</label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={formData.role === 'buyer'} // Make it required if Buyer is selected
                />
                {formData.image && <p className="image-label">Selected file: {formData.image.name}</p>}
              </div>
            )}
            
            <button type="submit" className="verify-btn">
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardamomAuctionForm;
