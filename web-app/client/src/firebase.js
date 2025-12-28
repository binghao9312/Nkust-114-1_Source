// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBK2mxkC9UY1Dv0bQK9Zl7eLj727375bf8fd",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "speedy-1f0c9.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "speedy-1f0c9",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "speedy-1f0c9.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "658935933384",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:658935933384:web:0a7b1b913e502",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GJZN5Z2J6H33384"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
