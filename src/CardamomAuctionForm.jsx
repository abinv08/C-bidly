import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './Firebase';
import './CardamomAuctionForm.css';
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
    return <div>Loading...</div>;
  }

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

            {formData.role === 'buyer' && (
              <div>
                <label htmlFor="image" className="image-label">
                  Bank Proof (5 Cr Security Deposit)
                </label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={formData.role === 'buyer'}
                />
                {formData.image && (
                  <p className="image-label">Selected file: {formData.image.name}</p>
                )}
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