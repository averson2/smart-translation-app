// Firebase Configuration
// ÖNEMLİ: Bu dosyayı Firebase Console'dan alınan gerçek değerlerle güncellemelisiniz!
// Firebase Console: https://console.firebase.google.com/
// Project Settings > General > Your apps > Firebase SDK snippet > Config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase'i başlat
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    showToast('Firebase yapılandırması gerekli! firebase-config.js dosyasını düzenleyin.');
}

// Firebase Auth referansı
const auth = firebase.auth();

// Session persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
