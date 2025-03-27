import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './Firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const CardamomAuctionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gst: '',
    license: '',
    role: '',
    image: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRegistration = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/LoginForm');
          return;
        }

        const registrationsRef = collection(firestore, 'auctions');
        const q = query(registrationsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          
          if (userData.isApproved) {
            if (userData.role === 'buyer') {
              navigate('/AuctionPage');
            } else if (userData.role === 'seller') {
              navigate('/SAuctionPage');
            }
          } else {
            navigate('/PendingApproval');
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking registration:", error);
        setIsLoading(false);
      }
    };

    checkUserRegistration();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login first');
        navigate('/loginForm');
        return;
      }

      // Get current user's details from users collection
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where("uid", "==", user.uid));
      const userSnapshot = await getDocs(userQuery);
      
      // Save data to Firebase Firestore with approval status and submitter info
      const docRef = await addDoc(collection(firestore, 'auctions'), {
        userId: user.uid,
        name: formData.name,
        gst: formData.gst,
        license: formData.license,
        role: formData.role,
        image: formData.image ? formData.image.name : null,
        createdAt: new Date(),
        isApproved: false,
        submittedBy: user.uid, // Store the user ID of the submitter
        submitterEmail: user.email, // Store the email from auth
        // Include any additional user details you want to store
      });

      console.log('Document written with ID: ', docRef.id);
      navigate('/PendingApproval');

    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('There was an error submitting the form.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        image: e.target.files[0]
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center fixed top-0 left-0 right-0 p-4 bg-white z-50">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 bg-opacity-15 -mt-12">
      <div className="max-w-xl mx-auto my-8 p-8 text-center">
        <br />
        <div className="bg-[#8ab84d] p-8 rounded-lg shadow-md">
          <h2 className="text-white mb-6">AUCTION REGISTRATION</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="AUCTIONOR NAME / COMPANY NAME"
              value={formData.name}
              onChange={handleChange}
              required
              className="p-3 border-none rounded text-base bg-gray-100"
            />
            <input
              type="text"
              name="gst"
              placeholder="GST NO:"
              value={formData.gst}
              onChange={handleChange}
              required
              className="p-3 border-none rounded text-base bg-gray-100"
            />
            <input
              type="text"
              name="license"
              placeholder="SPICESBOARD LICENCE NO:"
              value={formData.license}
              onChange={handleChange}
              required
              className="p-3 border-none rounded text-base bg-gray-100"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="p-3 border-none rounded text-base bg-gray-100 cursor-pointer"
            >
              <option value="">Select Role</option>
              <option value="buyer">BUYER</option>
              <option value="seller">SELLER/FARMER</option>
            </select>

            {formData.role === 'buyer' && (
              <div>
                <label htmlFor="image" className="text-white block mb-2">
                  Bank Proof (5 Cr Security Deposit)
                </label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={formData.role === 'buyer'}
                  className="w-full text-white"
                />
                {formData.image && (
                  <p className="text-white mt-2">Selected file: {formData.image.name}</p>
                )}
              </div>
            )}
            
            <button 
              type="submit" 
              className="bg-[#4285f4] text-white p-3 border-none rounded text-base cursor-pointer transition-colors duration-300 hover:bg-[#3367d6] mt-4"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardamomAuctionForm;