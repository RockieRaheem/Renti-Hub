// Firebase Configuration for RentiHub
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
