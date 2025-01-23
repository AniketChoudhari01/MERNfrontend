// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAM3FjclM0XIfG9ceU-Dg7SYELJM54AcIM",
  authDomain: "intern-area-5879e.firebaseapp.com",
  projectId: "intern-area-5879e",
  storageBucket: "intern-area-5879e.firebasestorage.app",
  messagingSenderId: "741869463374",
  appId: "1:741869463374:web:2e519ea9583e70b4afe01f",
  measurementId: "G-VJGMGQMNCS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
