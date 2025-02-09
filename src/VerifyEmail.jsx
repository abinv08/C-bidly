import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, reload, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { firestore } from './Firebase';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/Sign');
    }
  }, [location, navigate]);

  const checkVerification = async () => {
    if (!auth.currentUser) {
      toast.error("No user found. Please try signing up again.");
      navigate('/Sign');
      return;
    }

    try {
      await reload(auth.currentUser);
      
      if (auth.currentUser.emailVerified) {
        // Update user document to remove temporary flag and confirm verification
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          emailVerified: true,
          tempData: false // Remove temporary flag
        });

        toast.success("Email verified successfully!");
        navigate('/Homes');
      } else {
        toast.error("Email not yet verified. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      toast.error("Error checking verification status");
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      toast.error("No user found. Please try signing up again.");
      return;
    }

    if (countdown > 0) return;

    try {
      await sendEmailVerification(auth.currentUser);
      toast.info("Verification email resent!");
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Failed to resend verification email");
    }
  };

  return (
    <div className="form-container">
      <h2 className='title'>Verify Your Email</h2>
      <br />
      {/* <p>An email verification link has been sent to: {email}</p> */}
      <p>Please check your inbox and click on the verification link.</p>
       <p> {email}</p>
      <div className="verification-actions">
        <button 
          onClick={checkVerification} 
          className="verify-btn"
        >
          I've Verified My Email
        </button>

        <button 
          onClick={resendVerificationEmail} 
          className="resend-btn"
          disabled={countdown > 0}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
        </button>
      </div>

      <p className="verification-tips">
        Tips:
        <ul>
          <li>Check your spam/junk folder</li>
          <li>Verification link is valid for 1 hour</li>
          <li>You must verify your email to access the app</li>
        </ul>
      </p>
    </div>
  );
};

export default VerifyEmail;