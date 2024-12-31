// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIaiO09VMv7evCR5ITYk_dsXt6znKsvsw",
  authDomain: "album-review-21004.firebaseapp.com",
  projectId: "album-review-21004",
  storageBucket: "album-review-21004.appspot.com",
  messagingSenderId: "783248629515",
  appId: "1:783248629515:web:c64ddfabda372e6d434c0e",
  measurementId: "G-ZHSRPMJL0N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };

// Exporta a instância do banco de dados
export const database = getDatabase(app);
