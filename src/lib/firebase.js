// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCbhFAMj87fwVacLBnYIeqDeayqEpWCb0",
  authDomain: "chat-15e26.firebaseapp.com",
  projectId: "chat-15e26",
  storageBucket: "chat-15e26.appspot.com",
  messagingSenderId: "585563682310",
  appId: "1:585563682310:web:b52b16f1b2ff6eae0c7587"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const db = getFirestore();
export const auth = getAuth(app);
export const storage = getStorage();
