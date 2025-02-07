import React, { useState } from 'react';
import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';  
import { toast } from 'react-toastify';
import { auth, firestore } from './Firebase';

const Sign = () => {
  const navigate = useNavigate();

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      if (result.user) {
        // For Google login, we'll assume email is verified
        toast.success("User logged in successfully", {
          position: "top-center",
        });
        navigate("/Price");
      }
    } catch (error) {
      toast.error("Error with Google login");
      console.error(error);
    }
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');

  
  const phoneRegex = /^[789]\d{9}$/;  // Regex to validate Indian phone number (starts with 7, 8, or 9 and has 10 digits)

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    
    // Allow only digits and limit the length to 10 digits
    const formattedInput = input.replace(/[^\d]/g, ''); // Remove all non-digit characters
    if (formattedInput.length <= 10) {
      setPhone(formattedInput);  // Only set phone number if it's still valid
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

      if (userCredential) {
        const user = userCredential.user;
        
        // Send email verification
        await sendEmailVerification(user);
        
        // Store user information in Firestore, but mark as not verified
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          name: name,
          email: email,
          phone: phone,
          emailVerified: false  // Add a flag to track email verification
        });

        toast.info("Verification email sent. Please verify your email before logging in.", {
          position: "top-center",
        });

        // Redirect to a page that checks verification status
        navigate("/VerifyEmail", { 
          state: { 
            email: email,
            uid: user.uid 
          } 
        });
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/email-already-in-use') {
        toast.error('Email already in use');
        alert('Email already in use')
      } else if (errorCode === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="form-container">
      <p className="title">Create Account</p>
      <form className="form" onSubmit={submit}>
        <input
          type="text"
          className="input"
          value={name}
          placeholder="Name:"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          className="input"
          value={email}
          placeholder="Email:"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="number"
          className="input"
          value={phone}
          placeholder="Phone No:"
          onChange={handlePhoneChange}
          // onMouseOver={alert("Indian number only")}
          // onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          className="input"
          value={pass}
          placeholder="Password"
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <button type="submit" className="form-btn">Sign Up</button>
      </form>
      <p className="sign-up-label">
        Already have an account? <Link to="/LoginForm" className="sign-up-link">Log in</Link>
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
            {/* Google icon SVG paths remain the same */}
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            {/* Rest of the SVG paths */}
          </svg>
          <span>Sign up with Google</span>
        </div>
      </div>
    </div>
  );
};

export default Sign;