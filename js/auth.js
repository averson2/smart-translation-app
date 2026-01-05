// Authentication Functions

// Handle Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Giriş başarılı!');
    } catch (error) {
        console.error('Login error:', error);
        showToast(getAuthErrorMessage(error.code));
    }
});

// Handle Register
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        showToast('Şifreler eşleşmiyor!');
        return;
    }
    
    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır!');
        return;
    }
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showToast('Kayıt başarılı!');
    } catch (error) {
        console.error('Register error:', error);
        showToast(getAuthErrorMessage(error.code));
    }
});

// Handle Forgot Password
document.getElementById('forgot-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Şifre sıfırlama e-postası gönderildi!');
        showScreen('login-screen');
    } catch (error) {
        console.error('Password reset error:', error);
        showToast(getAuthErrorMessage(error.code));
    }
});

// Logout
async function logout() {
    try {
        await auth.signOut();
        showToast('Çıkış yapıldı');
        closeMenu();
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Çıkış yapılırken hata oluştu');
    }
}

// Auth State Observer
auth.onAuthStateChanged((user) => {
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        
        if (user) {
            // User is signed in
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            initializeApp();
        } else {
            // User is signed out
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            showScreen('login-screen');
        }
    }, 2000); // Splash screen delay
});

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

// Show Auth Screen
function showScreen(screenId) {
    document.querySelectorAll('.auth-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// Get User-Friendly Error Messages
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı',
        'auth/wrong-password': 'Hatalı şifre',
        'auth/email-already-in-use': 'Bu e-posta zaten kullanılıyor',
        'auth/invalid-email': 'Geçersiz e-posta adresi',
        'auth/weak-password': 'Şifre çok zayıf',
        'auth/network-request-failed': 'Ağ bağlantısı hatası',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin',
    };
    
    return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
