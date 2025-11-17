// Database functions

// Check if user already registered
async function checkExistingRegistration(userId) {
    try {
        const snapshot = await db.collection('pendaftaran')
            .where('userId', '==', userId)
            .get();
            
        if (!snapshot.empty) {
            showMessage('Anda sudah mengirim pendaftaran sebelumnya. Tunggu konfirmasi admin.', 'info');
            document.getElementById('waInstruction').style.display = 'block';
        }
    } catch (error) {
        console.error("Error checking registration:", error);
    }
}

// Upload file to Firebase Storage
async function uploadFile(file, fileName) {
    try {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`documents/${currentUser.uid}/${fileName}`);
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

// Submit registration form
async function submitPendaftaran(formData) {
    setLoading(true);
    
    try {
        // Upload files
        const files = {
            kk: await uploadFile(formData.fileKK, 'kk'),
            ktpAyah: await uploadFile(formData.fileKTPAyah, 'ktp_ayah'),
            ktpIbu: await uploadFile(formData.fileKTPIbu, 'ktp_ibu'),
            ijazah: await uploadFile(formData.fileIjazah, 'ijazah'),
            akte: await uploadFile(formData.fileAkte, 'akte'),
            foto: await uploadFile(formData.fileFoto, 'foto')
        };
        
        // Save registration data
        const pendaftaranData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userNama: currentUser.displayName,
            namaAyah: formData.namaAyah,
            namaIbu: formData.namaIbu,
            namaAnak: formData.namaAnak,
            emailOrtu: formData.emailOrtu,
            teleponAyah: formData.teleponAyah,
            teleponIbu: formData.teleponIbu,
            tanggalLahir: formData.tanggalLahir,
            alamat: formData.alamat,
            files: files,
            status: 'pending',
            tanggalDaftar: new Date(),
            createdAt: new Date()
        };
        
        await db.collection('pendaftaran').add(pendaftaranData);
        
        showMessage('Pendaftaran berhasil dikirim! Tunggu konfirmasi admin.', 'success');
        document.getElementById('waInstruction').style.display = 'block';
        document.getElementById('pendaftaranForm').reset();
        
    } catch (error) {
        console.error("Error submitting registration:", error);
        showMessage('Error mengirim pendaftaran: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Load admin data
async function loadAdminData() {
    try {
        const snapshot = await db.collection('pendaftaran')
            .orderBy('tanggalDaftar', 'desc')
            .get();
            
        displayAdminData(snapshot);
    } catch (error) {
        console.error("Error loading admin data:", error);
        showMessage('Error memuat data: ' + error.message, 'error');
    }
}

// Search data
async function searchData() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    try {
        let snapshot;
        if (searchTerm) {
            // Search in multiple fields
            const query1 = db.collection('pendaftaran')
                .where('namaAnak', '>=', searchTerm)
                .where('namaAnak', '<=', searchTerm + '\uf8ff');
                
            const query2 = db.collection('pendaftaran')
                .where('namaAyah', '>=', searchTerm)
                .where('namaAyah', '<=', searchTerm + '\uf8ff');
                
            const [snap1, snap2] = await Promise.all([query1.get(), query2.get()]);
            
            const combinedDocs = new Map();
            snap1.docs.forEach(doc => combinedDocs.set(doc.id, doc));
            snap2.docs.forEach(doc => combinedDocs.set(doc.id, doc));
            
            snapshot = { docs: Array.from(combinedDocs.values()) };
        } else {
            snapshot = await db.collection('pendaftaran')
                .orderBy('tanggalDaftar', 'desc')
                .get();
        }
        
        displayAdminData(snapshot);
    } catch (error) {
        console.error("Error searching data:", error);
        showMessage('Error mencari data: ' + error.message, 'error');
    }
}

// Display admin data in table
function displayAdminData(snapshot) {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Belum ada data pendaftaran</td></tr>';
        return;
    }
    
    snapshot.forEach((doc, index) => {
        const data = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${data.namaAnak}</strong></td>
            <td>
                <small><strong>Ayah:</strong> ${data.namaAyah}</small><br>
                <small><strong>Ibu:</strong> ${data.namaIbu}</small>
            </td>
            <td>${data.emailOrtu}</td>
            <td>
                <small><strong>Ayah:</strong> ${data.teleponAyah}</small><br>
                <small><strong>Ibu:</strong> ${data.teleponIbu}</small>
            </td>
            <td>
                <span class="status-badge status-${data.status}">
                    ${data.status === 'pending' ? 'MENUNGGU' : 'DIKONFIRMASI'}
                </span>
            </td>
            <td><small>${new Date(data.tanggalDaftar?.toDate()).toLocaleDateString('id-ID')}</small></td>
            <td>
                <div class="file-links">
                    <a href="${data.files?.kk}" target="_blank" class="file-link">KK</a>
                    <a href="${data.files?.ktpAyah}" target="_blank" class="file-link">KTP Ayah</a>
                    <a href="${data.files?.ktpIbu}" target="_blank" class="file-link">KTP Ibu</a>
                    <a href="${data.files?.ijazah}" target="_blank" class="file-link">Ijazah</a>
                    <a href="${data.files?.akte}" target="_blank" class="file-link">Akte</a>
                    <a href="${data.files?.foto}" target="_blank" class="file-link">Foto</a>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    ${data.status === 'pending' ? 
                        `<button onclick="confirmPendaftaran('${doc.id}')" class="btn-success">✓ Konfirmasi</button>` : 
                        '<span style="color: green; font-weight: bold;">✓</span>'
                    }
                    <button onclick="viewDetails('${doc.id}')" class="btn-warning">👁️ Detail</button>
                    <button onclick="deletePendaftaran('${doc.id}')" class="btn-danger">🗑️ Hapus</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Confirm registration
async function confirmPendaftaran(docId) {
    try {
        await db.collection('pendaftaran').doc(docId).update({
            status: 'confirmed',
            confirmedAt: new Date()
        });
        
        showMessage('Pendaftaran berhasil dikonfirmasi!', 'success');
        loadAdminData();
    } catch (error) {
        console.error("Error confirming registration:", error);
        showMessage('Error mengkonfirmasi: ' + error.message, 'error');
    }
}

// Delete registration
async function deletePendaftaran(docId) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        try {
            await db.collection('pendaftaran').doc(docId).delete();
            showMessage('Data berhasil dihapus!', 'success');
            loadAdminData();
        } catch (error) {
            console.error("Error deleting registration:", error);
            showMessage('Error menghapus data: ' + error.message, 'error');
        }
    }
}

// View details
async function viewDetails(docId) {
    try {
        const doc = await db.collection('pendaftaran').doc(docId).get();
        const data = doc.data();
        
        const details = `
Nama Anak: ${data.namaAnak}
Nama Ayah: ${data.namaAyah}
Nama Ibu: ${data.namaIbu}
Email: ${data.emailOrtu}
Telepon Ayah: ${data.teleponAyah}
Telepon Ibu: ${data.teleponIbu}
Tanggal Lahir: ${data.tanggalLahir}
Alamat: ${data.alamat}
Status: ${data.status}
Tanggal Daftar: ${new Date(data.tanggalDaftar?.toDate()).toLocaleString('id-ID')}
        `;
        
        alert('Detail Pendaftaran:\n\n' + details);
    } catch (error) {
        console.error("Error viewing details:", error);
        showMessage('Error memuat detail: ' + error.message, 'error');
    }
}