// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbtRL623y7qvFYBgiflQi8y9lyUERsRtY",
    authDomain: "website-pondok-pesantren.firebaseapp.com",
    projectId: "website-pondok-pesantren",
    storageBucket: "website-pondok-pesantren.firebasestorage.app",
    messagingSenderId: "78427033026",
    appId: "1:78427033026:web:617601af5fb83647f2da5b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized successfully");