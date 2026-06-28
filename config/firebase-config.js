// Firebase Configuration for RentiHub
// Replace these values with your actual Firebase project credentials

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyLwfV18rFd4o7UwD8YnvG_Vd5lER6gR0",
    authDomain: "rentihub.firebaseapp.com",
    projectId: "rentihub",
    storageBucket: "rentihub.firebasestorage.app",
    messagingSenderId: "729748895789",
    appId: "1:729748895789:web:fc29bf48370e4d9fa560a4"
};


// Initialize Firebase
let app, auth, db;

function initializeFirebase() {
    if (!firebase || !firebase.apps || firebase.apps.length === 0) {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        console.log("Firebase initialized successfully");
    } else {
        app = firebase.app();
        auth = firebase.auth();
        db = firebase.firestore();
    }

    return { app, auth, db };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase };
}
