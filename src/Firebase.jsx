// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import {  createUserWithEmailAndPassword } from "firebase/auth"; 
import {getAuth} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
// import 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyv6o7dyVScHtyU-Dv8v2cotYOeGcSLCI",
  authDomain: "c-bidly.firebaseapp.com",
  projectId: "c-bidly",
  storageBucket: "c-bidly.firebasestorage.app",
  messagingSenderId: "601727811440",
  appId: "1:601727811440:web:3fb5b8a83a659dc82099b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const provider = new GoogleAuthProvider();

