// Authentication functions
let currentUser = null;
let isAdmin = false;

// Check auth state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", user.email);
        
        // Check if user is admin
        try {
            const adminDoc = await db.collection('admins').doc(user.uid).get();
            if (adminDoc.exists) {
                isAdmin = true;
                showAdminPanel();
                document.getElementById('adminName').textContent = adminDoc.data().nama || 'Admin';
                showMessage('Login admin berhasil!', 'success');
            } else {
                isAdmin = false;
                showUserForm();
                document.getElementById('userName').textContent = user.displayName || user.email;
                checkExistingRegistration(user.uid);
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            isAdmin = false;
            showUserForm();
        }
    } else {
        currentUser = null;
        isAdmin = false;
        showLogin();
    }
});

// Login function
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Email dan password harus diisi!', 'error');
        return;
    }
    
    setLoading(true);
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Login berhasil!', 'success');
    } catch (error) {
        console.error("Login error:", error);
        let message = 'Login gagal! ';
        switch (error.code) {
            case 'auth/user-not-found':
                message += 'Email tidak ditemukan.';
                break;
            case 'auth/wrong-password':
                message += 'Password salah.';
                break;
            case 'auth/invalid-email':
                message += 'Format email tidak valid.';
                break;
            default:
                message += error.message;
        }
        showMessage(message, 'error');
    } finally {
        setLoading(false);
    }
}

// Register function
async function register() {
    const nama = document.getElementById('regNama').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!nama || !email || !password || !confirmPassword) {
        showMessage('Semua field harus diisi!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Password dan konfirmasi password tidak cocok!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password minimal 6 karakter!', 'error');
        return;
    }
    
    setLoading(true);
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: nama
        });
        
        // Save additional user data to Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            nama: nama,
            email: email,
            role: 'user',
            createdAt: new Date()
        });
        
        showMessage('Pendaftaran akun berhasil! Silakan login.', 'success');
        showLogin();
    } catch (error) {
        console.error("Registration error:", error);
        let message = 'Pendaftaran gagal! ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message += 'Email sudah digunakan.';
                break;
            case 'auth/invalid-email':
                message += 'Format email tidak valid.';
                break;
            case 'auth/weak-password':
                message += 'Password terlalu lemah.';
                break;
            default:
                message += error.message;
        }
        showMessage(message, 'error');
    } finally {
        setLoading(false);
    }
}

// Logout function
function logout() {
    auth.signOut()
        .then(() => {
            showMessage('Logout berhasil!', 'success');
        })
        .catch((error) => {
            console.error("Logout error:", error);
            showMessage('Error saat logout', 'error');
        });
}

// Set loading state
function setLoading(loading) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = loading;
    });
    
    if (loading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
}