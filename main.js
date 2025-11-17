// Main application functions

// Show sections
function showLogin() {
    hideAllSections();
    document.getElementById('loginSection').classList.add('active');
    document.getElementById('message').style.display = 'none';
}

function showRegister() {
    hideAllSections();
    document.getElementById('registerSection').classList.add('active');
    document.getElementById('message').style.display = 'none';
}

function showUserForm() {
    hideAllSections();
    document.getElementById('userFormSection').classList.add('active');
    document.getElementById('message').style.display = 'none';
}

function showAdminPanel() {
    hideAllSections();
    document.getElementById('adminPanel').classList.add('active');
    document.getElementById('message').style.display = 'none';
    loadAdminData();
}

function hideAllSections() {
    const sections = ['loginSection', 'registerSection', 'userFormSection', 'adminPanel'];
    sections.forEach(section => {
        document.getElementById(section).classList.remove('active');
    });
}

// Show message
function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// WhatsApp function
function openWhatsApp() {
    const phone = "087745672106";
    let text = "Halo, saya sudah mengisi formulir pendaftaran pondok pesantren. ";
    
    if (currentUser) {
        text += `Data saya: ${currentUser.displayName || currentUser.email}. `;
    }
    
    text += "Bagaimana cara melanjutkan pembayaran?";
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// Form submission handler
document.getElementById('pendaftaranForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Silakan login terlebih dahulu!', 'error');
        return;
    }

    // Get form values
    const formData = {
        namaAyah: document.getElementById('namaAyah').value.trim(),
        namaIbu: document.getElementById('namaIbu').value.trim(),
        namaAnak: document.getElementById('namaAnak').value.trim(),
        emailOrtu: document.getElementById('emailOrtu').value.trim(),
        teleponAyah: document.getElementById('teleponAyah').value.trim(),
        teleponIbu: document.getElementById('teleponIbu').value.trim(),
        tanggalLahir: document.getElementById('tanggalLahir').value,
        alamat: document.getElementById('alamat').value.trim(),
        fileKK: document.getElementById('fileKK').files[0],
        fileKTPAyah: document.getElementById('fileKTPAyah').files[0],
        fileKTPIbu: document.getElementById('fileKTPIbu').files[0],
        fileIjazah: document.getElementById('fileIjazah').files[0],
        fileAkte: document.getElementById('fileAkte').files[0],
        fileFoto: document.getElementById('fileFoto').files[0]
    };

    // Validation
    for (let key in formData) {
        if (!formData[key] && key.startsWith('file')) {
            showMessage('Semua dokumen harus diupload!', 'error');
            return;
        }
        if (!formData[key] && !key.startsWith('file')) {
            showMessage('Semua field harus diisi!', 'error');
            return;
        }
    }

    // File size validation (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    for (let key in formData) {
        if (key.startsWith('file') && formData[key] && formData[key].size > maxSize) {
            showMessage(`File ${key.replace('file', '')} terlalu besar! Maksimal 2MB.`, 'error');
            return;
        }
    }

    await submitPendaftaran(formData);
});

// Enter key support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeSection = document.querySelector('.form-section.active');
        if (activeSection.id === 'loginSection') {
            login();
        } else if (activeSection.id === 'registerSection') {
            register();
        }
    }
});

// File input validation
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                showMessage('File terlalu besar! Maksimal 2MB.', 'error');
                e.target.value = '';
            }
        }
    });
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Website Pondok Pesantren initialized");
    showLogin();
});