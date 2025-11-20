// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDUFZkl_ZtRVmSKJeYu2ZTR2enTQSqIp4",
  authDomain: "stream-line9.firebaseapp.com",
  projectId: "stream-line9",
  storageBucket: "stream-line9.firebasestorage.app",
  messagingSenderId: "421286457596",
  appId: "1:421286457596:web:17a0b0060ac13c67a7e779",
  measurementId: "G-TRJYXP5ZS4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;