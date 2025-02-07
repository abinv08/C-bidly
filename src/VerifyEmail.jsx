import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, reload, sendEmailVerification } from 'firebase/auth';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from navigation state
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // Redirect if no email is found
      navigate('/Sign');
    }
  }, [location, navigate]);

  const checkVerification = async () => {
    if (!auth.currentUser) return;

    try {
      await reload(auth.currentUser);
      
      if (auth.currentUser.emailVerified) {
        toast.success("Email verified successfully!", {
          position: "top-center",
        });
        navigate('/Pricesm');
      } else {
        toast.error("Email not yet verified. Please check your inbox.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      toast.error("An error occurred while checking verification");
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return;

    try {
      await sendEmailVerification(auth.currentUser);
      toast.info("Verification email resent!", {
        position: "top-center",
      });
      
      // Start 60-second cooldown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error resending verification email:", error);
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