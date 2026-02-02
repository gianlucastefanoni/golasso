// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyBdGXuIiDjFp84ErBGql86OEm9gyQTMI8Q",
    authDomain: "golasso-17530.firebaseapp.com",
    projectId: "golasso-17530",
    storageBucket: "golasso-17530.firebasestorage.app",
    messagingSenderId: "380558190244",
    appId: "1:380558190244:web:822de831bc4b1ac1bf6831",
    measurementId: "G-TKFNHKQGZ0"
  };

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Inizializza Cloud Firestore e ottieni un riferimento
const db = getFirestore(app);

// Esporta l'istanza db in modo da poterla usare in altri file
export { db, app };