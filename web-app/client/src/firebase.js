// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBK2mxkC9UY1Dv0bQK9Zl7eLj7toQerShQ",
    authDomain: "speedy-1f0c9.firebaseapp.com",
    projectId: "speedy-1f0c9",
    storageBucket: "speedy-1f0c9.firebasestorage.app",
    messagingSenderId: "658935933384",
    appId: "1:658935933384:web:0a7b1b913e5027375bf8fd",
    measurementId: "G-GJZN5Z2J6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
