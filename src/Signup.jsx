import React, { useState } from 'react';
import './index.css';
import { Link, useNavigate } from 'react-router-dom'; 
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; 
import { toast } from 'react-toastify';
import { auth } from './Firebase';

const Signup = () => {
  const navigate = useNavigate();

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      if (result.user) {
        toast.success("User logged in successfully", {
          position: "top-center",
        });
        navigate("/Pricesm");
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

  const submit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth(); // Get auth instance
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential) {
        toast.success("Account Created Successfully", {
          position: "top-center",
        });
        navigate("/Pricesm");  // Redirect to a different page after successful signup
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/email-already-in-use') {
        alert('Email already in use');
      } else if (errorCode === 'auth/weak-password') {
        alert('Password is too weak');
      } else {
        alert(errorMessage);
      }
    }
  };

  return (
    <>
      <div className="form-container">
        <p className="title">Create Account</p>
        <form className="form" onSubmit={submit}>
          <input
            type="text"
            className="input"
            value={name}
            placeholder="Name:"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="input"
            value={email}
            placeholder="Email:"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="number"
            className="input"
            value={phone}
            placeholder="Phone No:"
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="password"
            className="input"
            value={pass}
            placeholder="Password"
            onChange={(e) => setPass(e.target.value)}
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
              {/* SVG path for Google icon */}
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
            <span>Sign up with Google</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
