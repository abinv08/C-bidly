import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth'; // Ensure correct imports
import { auth } from './Firebase'; // Ensure Firebase is initialized correctly
import { toast } from 'react-toastify';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [emailForReset, setEmailForReset] = useState(''); // To store email for reset
  const [resetModal, setResetModal] = useState(false); // State to control reset modal visibility
  const navigate = useNavigate();

  // Google Login function
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider(); // Initialize the GoogleAuthProvider

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user info in sessionStorage or localStorage (optional)
      sessionStorage.setItem('userName', user.displayName);
      sessionStorage.setItem('userPhoto', user.photoURL);

      // Show success toast message
      toast.success('Logged in successfully!', {
        position: 'top-center',
      });

      // Navigate to Homes page
      navigate('/Homes');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Google login failed. Please try again.', {
        position: 'top-center',
      });
    }
  };

  // Handle email/password login with error handling
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (userCredential) {
        toast.success("Login Successful", {
          position: "top-center",
        });
        navigate("/Homes");  // Navigate to the Homes page after successful login
      }
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "Login failed. Incorrect password. Please try again."; // Default error message

      // Handling specific error codes
      if (errorCode === "auth/user-not-found") {
        errorMessage = "No user found with this email address.";
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
      }

      alert(errorMessage);
    }
  };

  // Handle the forgot password functionality
  const handleForgotPassword = async () => {
    if (!emailForReset) {
      alert("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailForReset);
      toast.success("Password reset email sent. Check your inbox.", {
        position: "top-center",
      });
      setResetModal(false); // Close the modal
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "Error resetting password. Please try again later.";

      // Handle specific errors
      if (errorCode === "auth/user-not-found") {
        errorMessage = "No user found with this email address.";
      }

      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  };

  return (
    <div className="form-container">
      <p className="title">Welcome back</p>
      <br />
      <form className="form">
        <input
          type="email"
          className="input"
          placeholder="Email:"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <p className="page-link" onClick={() => setResetModal(true)}>
          <span className="page-link-label">Forgot Password?</span>
        </p>
        <button type="submit" className="form-btn" onClick={handleLogin}>
          Log in
        </button>
      </form>
      <p className="sign-up-label">
        Don't have an account?{' '}
        <Link to="/Sign" className="sign-up-link">
          Sign up
        </Link>
      </p>
      <div className="buttons-container">
        <div className="google-login-button" onClick={googleLogin}>
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            version="1.1"
            x="0px"
            y="0px"
            className="google-icon"
            viewBox="0 0 48 48"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          <span>Log in with Google</span>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="reset-password-modal">
          <div className="modal-content">
            <h2>Reset Password</h2>
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
            />
            <button  onClick={handleForgotPassword}>Send Reset Email</button>
            <div onClick={() => setResetModal(false)}>Cancel</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
