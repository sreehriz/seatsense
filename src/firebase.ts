import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGAzimJnO-cvuKT-uOSe79t-NmE0kXAFw",
  authDomain: "seatsense-959cb.firebaseapp.com",
  projectId: "seatsense-959cb",
  storageBucket: "seatsense-959cb.firebasestorage.app",
  messagingSenderId: "17138481981",
  appId: "1:17138481981:web:ddb0ec86f996264ed92354",
  measurementId: "G-0PTGS31CKS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
