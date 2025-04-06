import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './index.css'; // You can keep this if other non-Tailwind styles are still needed
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './Firebase';
import { toast } from 'react-toastify';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [emailForReset, setEmailForReset] = useState('');
  const [resetModal, setResetModal] = useState(false);
  const navigate = useNavigate();

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      sessionStorage.setItem('userName', user.displayName);
      sessionStorage.setItem('userPhoto', user.photoURL);

      toast.success('Logged in successfully!', { position: 'top-center' });
      navigate('/Homes');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Google login failed. Please try again.', { position: 'top-center' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email.toLowerCase() === 'admin' && pass === '12345678') {
      toast.success("Admin Login Successful", { position: "top-center" });
      sessionStorage.setItem('isAdmin', 'true');
      navigate("/DashboardPage");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (userCredential) {
        toast.success("Login Successful", { position: "top-center" });
        sessionStorage.setItem('isAdmin', 'false');
        navigate("/Homes");
      }
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "Login failed. Incorrect password. Please try again.";
      if (errorCode === "auth/user-not-found") errorMessage = "No user found with this email address.";
      else if (errorCode === "auth/wrong-password") errorMessage = "Incorrect password. Please try again.";
      else if (errorCode === "auth/invalid-email") errorMessage = "The email address is not valid.";
      toast.error(errorMessage, { position: "top-center" });
      alert(errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailForReset) {
      toast.error("Please enter your email address.", { position: "top-center" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      toast.success("Password reset email sent. Check your inbox.", { position: "top-center" });
      setResetModal(false);
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "Error resetting password. Please try again later.";
      if (errorCode === "auth/user-not-found") errorMessage = "No user found with this email address.";
      toast.error(errorMessage, { position: "top-center" });
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/Sign');
  };

  return (
    <div className="w-[350px] h-[550px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)] rounded-[10px] box-border p-[20px_30px] ml-[35em]">
      <p className="text-center font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif] my-[10px_0_30px_0] text-[28px] font-extrabold">Welcome back</p>
      <br /><br />
      <form className="w-full flex flex-col gap-[18px] mb-[15px]">
        <input
          type="email"
          className="rounded-[20px] border border-[#c0c0c0] outline-none box-border p-[12px_15px]"
          placeholder="Email:"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="rounded-[20px] border border-[#c0c0c0] outline-none box-border p-[12px_15px]"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <p className="underline text-right text-[#747474]" onClick={() => setResetModal(true)}>
          <span className="cursor-pointer font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif] text-[9px] font-bold hover:text-black">Forgot Password?</span>
        </p>
        <button
          type="submit"
          className="p-[10px_15px] font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif] rounded-[20px] border-none outline-none bg-teal-500 text-white cursor-pointer shadow-[0_3px_8px_rgba(0,0,0,0.24)] active:shadow-none"
          onClick={handleLogin}
        >
          Log in
        </button>
      </form>
      <p className="m-0 text-[10px] text-[#747474] font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif]">
        Don't have an account?{' '}
        <span
          className="ml-[1px] text-[11px] underline text-teal-500 cursor-pointer font-extrabold font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif]"
          onClick={handleSignUpRedirect}
        >
          Sign up
        </span>
      </p>
      <div className="w-full flex flex-col justify-start mt-[20px] gap-[15px]">
        <div
          className="rounded-[20px] box-border p-[10px_15px] shadow-[0_10px_36px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)] cursor-pointer flex justify-center items-center font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif] text-[11px] gap-[5px] border-2 border-[#747474]"
          onClick={googleLogin}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            version="1.1"
            x="0px"
            y="0px"
            className="text-[18px] mb-[1px]"
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
      {resetModal && (
        <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-[rgba(0,0,0,0.5)] z-[1000]">
          <div className="bg-white p-5 rounded-lg text-center w-[90%] max-w-[350px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] mr-[55px]">

            <h2 className="mb-4 text-center font-extrabold">Reset Password</h2>
            <input
              type="email"
              className="rounded-[20px] border border-[#c0c0c0] outline-none box-border p-[12px_15px] mb-4 w-full"
              placeholder="Enter your email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <button
                className="p-[10px_15px] border-none rounded-md cursor-pointer bg-[#4CAF50] text-white"
                onClick={handleForgotPassword}
              >
                Send Reset Email
              </button>
              <button
                className="p-[10px_15px] border-none rounded-md cursor-pointer bg-[#f44336] text-white"
                onClick={() => setResetModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;