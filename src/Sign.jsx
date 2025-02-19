import React, { useState } from 'react';
import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { auth, firestore } from './Firebase';

const Sign = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const formattedInput = input.replace(/[^\d]/g, ''); // Remove non-digit characters
    if (formattedInput.length <= 10) {
      setPhone(formattedInput); // Only set phone number if it's valid
    }
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // Store Google user data in Firestore
        const userRef = doc(firestore, 'users', result.user.uid);
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          emailVerified: true,
          authProvider: 'google',
          createdAt: new Date().toISOString(),
        });

        toast.success("Successfully signed in with Google", {
          position: "top-center",
        });
        navigate("/Homes");
      }
    } catch (error) {
      toast.error("Error with Google login: " + error.message, {
        position: "top-center",
      });
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

        // Store user information in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          name: name,
          email: email,
          phone: phone,
          emailVerified: false, // Add a flag to track email verification
          authProvider: 'email',
          createdAt: new Date().toISOString(),
        });

        toast.info("Verification email sent. Please verify your email before logging in.", {
          position: "top-center",
        });

        // Redirect to a page that checks verification status
        navigate("/VerifyEmail", {
          state: {
            email: email,
            uid: user.uid,
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error.code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : error.code === 'auth/weak-password'
          ? 'Password is too weak'
          : error.message;

      toast.error(errorMessage, {
        position: "top-center",
      });
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
          type="text"
          className="input"
          value={phone}
          placeholder="Phone No:"
          onChange={handlePhoneChange}
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
        <button type="submit" className="form-btn">
          Sign Up
        </button>
      </form>
      <p className="sign-up-label">
        Already have an account?{' '}
        <Link to="/LoginForm" className="sign-up-link">
          Log in
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
          </svg>
          <span>Sign up with Google</span>
        </div>
      </div>
    </div>
  );
};

export default Sign;