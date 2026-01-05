// Firebase Configuration
// Firebase Console: https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyCDEqbVx0LB5zwqO28K-ttdEnCA09E3oWg",
    authDomain: "translate-1efaf.firebaseapp.com",
    projectId: "translate-1efaf",
    storageBucket: "translate-1efaf.firebasestorage.app",
    messagingSenderId: "48218175438",
    appId: "1:48218175438:web:b96956c77a76574d0edd9f",
    measurementId: "G-JL90KCTVBH"
};

// Firebase'i başlat
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    showToast('Firebase yapılandırması başarısız!');
}

// Firebase Auth referansı
const auth = firebase.auth();

// Session persistence - kullanıcı oturumu kalıcı olsun
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
